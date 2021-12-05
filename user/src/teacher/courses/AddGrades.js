import { useState, useEffect, useContext } from 'react';
import apiLink from "../../API";
import { useHistory } from 'react-router-dom';
import { TeacherContext } from "../Teacher";
import { CourseContext } from "./Course";

/* This component is responsible for handling uploading a bunch of grades for
 * all the students of a course. */
function AddGrades(props) {
	const course = useContext(CourseContext);
	const teacherId = useContext(TeacherContext);
	const history = useHistory();

	const [students, setStudents] = useState([]);
	const [gradeLimits, setGradeLimits] = useState({
		minGrade: 4,
		maxGrade: 10
	});
	useEffect(() => {
		const token = sessionStorage.getItem("jwt");
		const bearer = 'Bearer ' + token;
		const fetchStudents = async () => {
			await fetch(`${apiLink}/teachers/${teacherId}/courses/${course.id}/students`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setStudents(res.result);

						// also populate the list of grades with a default value
						const array = [];
						for (let i = 0; i < res.result.length; i++) {
							array.push(4);
						}
						setGrades(array);
					} else {
						alert("Error", res.message, "error");
					}
				}).catch(_ => console.log(_));
		}
		const fetchMaxAndMinGrade = async () => {
			await fetch(`${apiLink}/teachers/${teacherId}/gradeLimits`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					console.log(res);
					if (res.status === "OK") {
						setGradeLimits({ minGrade: res.result.minGrade, maxGrade: res.result.maxGrade });
						console.log("Grades changed");
					} else {
						alert("Error", res.message, "error");
					}
				}).catch(_ => console.log(_));
		}

		fetchStudents();
		fetchMaxAndMinGrade();
	}, [teacherId, course.id]);

	// session will hold the common values for all the grades
	const [session, setSession] = useState({
		comment: "",
		date: ""
	});

	// will hold the grades for each student
	const [grades, setGrades] = useState([]);

	// handles <input> element changes
	const handleChange = (event) => {
		const target = event.target;
		const name = target.name;

		setSession({ ...session, [name]: target.value });
		event.preventDefault();
	}

	// submits the information into the api
	const onSubmit = async () => {
		if (session.comment === "" || session.date === "") {
			alert("Error", "Grade comment is empty!", "error");
			return;
		}
		/* Creates an array where each element an object with a student id and
		 * a grade, this array is created from two existing arrays:
		 *      1. The students array from which we map
		 *      2. The grades array where grades[i] belongs to students[i]
		 *          
		 * */
		const studentGradeList = students.map((student, key) => {
			return { id: student.id, grade: grades[key] };
		});
		/* Creates the body of the post request */
		const body = {
			comment: session.comment,
			date: session.date,
			students: studentGradeList
		};

		const token = sessionStorage.getItem("jwt");
		const bearer = "Bearer " + token;
		await fetch(`${apiLink}/teachers/${teacherId}/courses/${course.id}/grades`, {
			method: 'post',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': bearer
			},
			body: JSON.stringify(body)
		})
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					const result = res.result;
					if (result.affectedRows === students.length) {
						alert("Success!", "Grades were added successfully", "success");
						history.push(`/t/${teacherId}/courses/${course.id}/grades`);
					}
				} else {
					alert("Error", res.message, "error");
				}
			})
			.catch((err) => console.log(err));
	}

	// creates a different callback function for each student row
	// to modify it's own grade via the two buttons provided 
	const functionGenerator = (key) => {

		const callback = (delta) => {

			const newArray = [...grades];
			newArray[key] += delta;

			/* Check if the new value conforms to the rules */
			/* Here instead of 10 and 4 put max and min grade */
			if (newArray[key] > gradeLimits.maxGrade || newArray[key] < gradeLimits.minGrade) {
				alert("Error", "Not allowed!", "error");
				return;
			}

			setGrades(newArray)
		}
		return callback;
	}

	return (
		<div className="add-grades">
			<h3>Add grades</h3>
			<label>
				Comment:
				<input name="comment" type="text" value={session.comment} onChange={handleChange} />
			</label>
			<label>
				Date:
				<input name="date" type="date" value={session.date} onChange={handleChange} />
			</label>
			<button onClick={onSubmit}>Submit</button>
			<div className="horizontal-divider"></div>
			<table>
				<thead>
					<tr>
						<th>Id</th>
						<th>Firstname</th>
						<th>Lastname</th>
						<th>Grade</th>
						<th></th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{students.map((student, key) => <StudentRow key={key} student={student} grade={grades[key]} callback={functionGenerator(key)} />)}
				</tbody>
			</table>
		</div>
	);
}

/* Just displays a single row tha contains information about a student */
const StudentRow = (props) => {
	const student = props.student;
	const callback = props.callback;
	return (
		<tr>
			<td>{student.id}</td>
			<td>{student.firstname}</td>
			<td>{student.lastname}</td>
			<td>{props.grade}</td>
			<td>
				<button onClick={() => callback(-1)}><i className="material-icons">remove</i></button>
			</td>
			<td>
				<button onClick={() => callback(1)}><i className="material-icons">add</i></button>
			</td>
		</tr>
	);
}

/* This component is responsible for handling uploading a single student grade */
function AddSingleGrade(props) {
	/* Use the defined contexts */
	const history = useHistory();
	const teacherId = useContext(TeacherContext);
	const course = useContext(CourseContext);

	/* Will hold the controlled form information */
	const [form, setForm] = useState({
		comment: "",
		date: "",
		studentId: -1,
		grade: 4
	});

	/* This state holds the students of the course */
	const [students, setStudents] = useState([]);
	useEffect(() => {
		const fetchStudents = async () => {

			const token = sessionStorage.getItem("jwt");
			const bearer = "Bearer " + token;

			await fetch(`${apiLink}/teachers/${teacherId}/courses/${course.id}/students`, {
				headers: { 'Authorization': bearer }
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setStudents(res.result);
						if (res.result.length > 0) {
							setForm({ ...form, 'studentId': res.result[0].id });
						}
					} else {
						alert("Error", res.message, "error");
					}
				}).catch(_ => console.log(_));
		}

		fetchStudents();
	}, []);

	/* Handles input changes and validates them */
	const handleChange = (event) => {
		event.preventDefault();

		const name = event.target.name;
		const value = event.target.value;

		if (name === "grade") {
			if (value > 10 || value < 4) {
				alert("Error", "Grade cannot be bigger than 10 or smaller than 4!", "error");
				return;
			}
		}

		setForm({ ...form, [name]: value });
	}

	/* Handles submitting the form in the api */
	const onSubmit = async (event) => {
		event.preventDefault();
		/* input validation */
		if (form.date === "" || form.comment === "") {
			alert("Error", "Either no comment or the date is not set!", "error");
			return;
		}

		/* Create the body of the request */
		const body = {
			comment: form.comment,
			date: form.date,
			students: [{ id: form.studentId, grade: form.grade }]
		};

		/* Make the request */
		const token = sessionStorage.getItem("jwt");
		const bearer = "Bearer " + token;
		await fetch(`${apiLink}/teachers/${teacherId}/courses/${course.id}/grades`, {
			method: 'post',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': bearer
			},
			body: JSON.stringify(body)
		})
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					alert("Success!", res.message, "success");
					history.push(`/t/${teacherId}/courses/${course.id}/grades`);
				} else {
					alert("Error", res.message, "error");
				}
			});
	}


	return (
		<div className="add-grades">
			<h3>Add grade for student</h3>
			<label>
				Comment:
				<input onChange={handleChange} value={form.comment} name="comment" type="text" />
			</label>
			<label>
				Date:
				<input onChange={handleChange} value={form.date} name="date" type="date" />
			</label>
			<label>
				Select the student:
				<select onChange={handleChange} value={form.studentId} name="studentId">
					{students.map(student => <option
						key={student.id}
						value={student.id}
					>
						{`${student.firstname} ${student.lastname}`}
					</option>)}
				</select>
			</label>
			<label>
				Select the grade:
				<input onChange={handleChange} value={form.grade} name="grade" type="number" step="1" min={4} max={10} />
			</label>
			<button onClick={onSubmit}>Submit</button>
		</div>
	);
}

export default AddGrades;
export { AddSingleGrade };
