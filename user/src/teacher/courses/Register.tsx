import React, { useState, useEffect, useContext } from 'react';
import ReactDOM from 'react-dom';
import apiLink from '../../API';
import { TeacherContext } from '../Teacher';
import { CourseContext } from './Course';

interface Student {
	id: number
	firstname: string
	lastname: string
}

interface StudentRowProps {
	student: Student
	courseInstanceId: number
	month: number
	year: number
}

interface RegisterCell {
	id: number,
	mark: string,
	comment: string,
	date: string,
	studentID: number,
	courseInstanceID: number
}

const months = [
	{
		name: "January",
		length: 31,
	},
	{
		name: "February",
		length: 29
	},
	{
		name: "March",
		length: 31
	},
	{
		name: "April",
		length: 30
	},
	{
		name: "May",
		length: 31
	},
	{
		name: "June",
		length: 30
	},
	{
		name: "July",
		length: 31
	},
	{
		name: "August",
		length: 31
	},
	{
		name: "September",
		length: 30
	},
	{
		name: "October",
		length: 31
	},
	{
		name: "November",
		length: 30
	},
	{
		name: "December",
		length: 31
	},
];

const Register = () => {
	/* Determines the month that we are viewing */
	const [date, setDate] = useState({
		/* We add one because we want to represent the months starting counting from
		* 1 not from 0, for example January is 1, December is 12 */
		month: new Date(Date.now()).getMonth() + 1,
		year: new Date(Date.now()).getFullYear()
	});

	/* used to get the students of this class */
	const teacherId = useContext(TeacherContext);
	const course = useContext(CourseContext);
	const courseInstanceId = (course as any).id;

	/* Holds the students of this class */
	const [students, setStudents] = useState<Student[]>([]);
	useEffect(() => {
		const fetchStudents = async () => {
			const bearer = "Bearer " + sessionStorage.getItem("jwt");
			await fetch(`${apiLink}/teachers/${teacherId}/courses/${courseInstanceId}/students`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setStudents(res.result);
					} else {
						(alert as any)("Error", res.message, "error");
					}
				}).catch(_ => alert("Something went wrong"));
		}
		fetchStudents();
	}, [teacherId]);

	/* Method for going into the next month */
	const next = () => {
		if (date.month === 12) {
			setDate({
				month: 1,
				year: date.year + 1
			});
		} else {
			setDate({
				month: date.month + 1,
				year: date.year
			});
		}
	}
	/* Method for going into the previous month */
	const prev = () => {
		if (date.month === 1) {
			setDate({
				month: 12,
				year: date.year - 1
			});
		} else {
			setDate({
				month: date.month - 1,
				year: date.year
			});
		}
	}

	return (
		<div className="register">

			<div className="header">
				<button onClick={prev}><i className="material-icons">arrow_back_ios</i></button>
				<h2>{`${months[date.month - 1].name} - ${date.year}`}</h2>
				<button onClick={next}><i className="material-icons">arrow_forward_ios</i></button>
			</div>

			<Days month={date.month} />

			<div>
				{students.map(student =>
					<StudentRow key={student.id}
						student={student}
						month={date.month}
						year={date.year}
						courseInstanceId={courseInstanceId} />)}
			</div>

			<div id="popup-container">
			</div>
		</div>
	);
}

/* Prints a horizontal line of days of the month */
const Days = (props: { month: number }) => {
	/* Create a list of days with the length of the specified month */
	let days = [];
	for (let i = 0; i < months[props.month - 1].length; i++) {
		days.push(i + 1);
	}
	return (
		<div className="student-row">
			<p>Days</p>
			{days.map(day => (
				<div className="element">
					<p>{day.toString()}</p>
				</div>
			))}
		</div>
	);
}

/* Displays a single student */
const StudentRow = (props: StudentRowProps) => {
	const teacherId = useContext(TeacherContext);
	const courseInstanceId = props.courseInstanceId;

	/* Create a list of empty days, that hold no grade */
	let emptyDays: RegisterCell[] = [];
	for (let i = 0; i < months[props.month - 1].length; i++) {
		emptyDays.push({
			id: 0,
			mark: "",
			comment: "",
			date: `${props.year}-${props.month}-${i + 1}`,
			studentID: props.student.id,
			courseInstanceID: courseInstanceId
		});
	}

	/* Get the marks for this single user */
	const [days, setDays] = useState<RegisterCell[]>([]);
	useEffect(() => {

		setDays(emptyDays);

		const fetchGrades = async () => {
			const bearer = "Bearer " + sessionStorage.getItem("jwt");

			const query = `month=${props.month}&year=${props.year}&courseInstanceID=${courseInstanceId}`;

			await fetch(`${apiLink}/teachers/${teacherId}/students/${props.student.id}/marks?${query}`, {
				headers: {
					'Authorization': bearer,
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						const newDays = [...emptyDays];
						for (let i = 0; i < res.result.length; i++) {
							/* The result[i].date is the date of the current grade
							 * in format (2021-01-24),
							 * to determine it's correct position in the array we
							 * need to know the day, we split the string and
							 * access the correct element.*/
							const day = parseInt(res.result[i].date.split("-")[2]);
							newDays[day - 1] = res.result[i];
						}
						setDays(newDays);
					} else {
						(alert as any)("Error", res.message, "error");
					}
				}).catch(err => console.log(err.message));
		}
		fetchGrades();
	}, [teacherId, props.month, props.year]);

	return (
		<div className="student-row">
			<p><b>{`${props.student.firstname} ${props.student.lastname}`}</b></p>
			{days.map((day, index) => <Cell key={index} cell={day} teacherId={teacherId} />)}
		</div>
	);
}

/* Displays one register cell */
const Cell = (props: { cell: RegisterCell, teacherId: number }) => {
	/* Will hold the mark and comment, we need this state */
	const [cell, setCell] = useState({
		id: 0,
		mark: "",
		comment: ""
	});
	useEffect(() => {
		setCell(props.cell);
	}, [props.cell]);

	const updateMark = (id: number, mark: string, comment: string) => {
		setCell({
			id: id,
			mark: mark,
			comment: comment
		});
	}

	const onClick = () => {
		/* We do this atrocity because when the popup shows, we have to make
		 * sure it displays the newly updated mark and comment, that is if this
		 * mark was updated. If we don't do this, event though the mark is
		 * updated in the database and the state of this component it will not
		 * appear updated in popup because the old props.cell is passed. */
		const updatedCell = { ...props.cell, id: cell.id, mark: cell.mark, comment: cell.comment };

		const popUpContainer = document.getElementById("popup-container");
		ReactDOM.render(
			<ModifyCell cell={updatedCell} teacherId={props.teacherId} updateMark={updateMark} />,
			popUpContainer);
	}

	return (
		<div className="element">
			<p onClick={onClick}>{cell.mark}</p>
		</div>
	);
}

/* I have to pass the teacherId like this because useContext hook won't work for
 * some fucking reason. It just holds the default value for TeacherContext */
const ModifyCell = (props: {
	cell: RegisterCell,
	teacherId: number,
	updateMark: (id: number, mark: string, comment: string) => void
}) => {
	const [form, setForm] = useState(props.cell);

	const closePopup = (event: React.FormEvent) => {
		event.preventDefault();
		const popUpContainer = document.getElementById("popup-container");
		ReactDOM.unmountComponentAtNode(popUpContainer!!);
	}

	const onChange = (event: React.ChangeEvent) => {
		event.preventDefault();
		const name = (event.target as any).name;
		const value = (event.target as any).value;

		setForm({ ...form, [name]: value });
	}

	const onSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		/* If the id of the cell is 0, then make a post request to create a new
		 * one, else modify the old one */
		let body: any;
		let url: string = "";
		let method: string = "";
		const bearer = "Bearer " + sessionStorage.getItem("jwt");
		if (form.id === 0) {
			/* Create a new register cell */
			body = {
				mark: form.mark,
				comment: form.comment,
				date: form.date,
				studentID: form.studentID,
				courseInstanceID: form.courseInstanceID
			}
			url = `${apiLink}/teachers/${props.teacherId}/students/${form.studentID}/marks`;
			method = 'post';
		} else {
			/* Modify the existing one */
			body = {
				mark: form.mark,
				comment: form.comment,
			}
			url = `${apiLink}/teachers/${props.teacherId}/students/${form.studentID}/marks/${props.cell.id}`;
			method = 'put';
		}

		await fetch(url, {
			method: method,
			headers: {
				'Authorization': bearer,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		})
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					(alert as any)("Success", "Mark added successfully!", "success");

					/* Previously the id could have been 0, if it was that means
					 * that we perform a post request and created a new mark.
					 * Now that a new mark is created, we also need to update
					 * the id in the table cell to represent the newly
					 * created mark. This expression checks that:
					 */
					const id = form.id === 0 ? res.result.insertId : form.id;
					props.updateMark(id, form.mark, form.comment);

					/* Remove the popup */
					const popUpContainer = document.getElementById("popup-container");
					ReactDOM.unmountComponentAtNode(popUpContainer!!);
				} else {
					alert(res.message);
				}
			}).catch(err => console.log(err));
	}

	const deleteMark = async (event: any) => {
		event.preventDefault();

		const bearer = "Bearer " + sessionStorage.getItem("jwt");
		await fetch(`${apiLink}/teachers/${props.teacherId}/students/${form.studentID}/marks/${props.cell.id}`, {
			method: 'delete',
			headers: {
				'Authorization': bearer
			}
		})
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					(alert as any)("Success", "Mark deleted successfully!", "success");
					/* the 0 id represents an empty cell */
					props.updateMark(0, "", "");
					const popUpContainer = document.getElementById("popup-container");
					ReactDOM.unmountComponentAtNode(popUpContainer!!);
				} else {
					(alert as any)("Error", res.message, "error");
				}
			}).catch(err => console.log(err));
	}
	return (
		<div className="popup" id="popup">
			<form onSubmit={onSubmit}>
				<label>
					Mark:
    <input name="mark" onChange={onChange} value={form.mark} />
				</label>
				<label>
					Comment:
    <input name="comment" onChange={onChange} value={form.comment} />
				</label>
				<button>Update</button>
				<button className="danger" onClick={deleteMark}>Delete</button>
				<button onClick={closePopup}>Cancel</button>
			</form>
		</div>
	);
}

export default Register;
