import { useState, useEffect, useContext } from 'react';
import { useHistory } from "react-router-dom";
import apiLink from "../../API";
import { TeacherContext } from "../Teacher";
import { CourseContext } from "./Course";

/* Checks whether a string can be converted to an integer */
const isNumeric = (string) => {
	return /^-?\d+$/.test(string) || string === "";
}

function NewSession(props) {

	const course = useContext(CourseContext);
	const teacherId = useContext(TeacherContext);
	const history = useHistory();

	/* Gets the list of students for a course */
	const [students, setStudents] = useState([]);
	useEffect(() => {
		const fetchStudents = async () => {

			const token = sessionStorage.getItem("jwt");
			const bearer = 'Bearer ' + token;

			await fetch(`${apiLink}/teachers/${teacherId}/courses/${course.id}/students`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						const students = res.result;
						/* Set the list of students to the recieved one */
						setStudents(students);

						/* Create an initial array that represents how many hours 
						 * each student attended */
						const array = [];
						for (let i = 0; i < students.length; i++) {
							array[i] = 1;
						}
						setAttendedList(array);

					} else {
						alert("Error", res.message, "error");
					}
				}).catch(_ => console.log(_));
		}

		fetchStudents();

	}, []);

	/* This state holds session information, which will be manipulated by the
	 * teacher */
	const [session, setSession] = useState({
		week: 0,
		topic: "",
		type: "lecture",
		length: 1,
		date: ""
	});

	const [attendedList, setAttendedList] = useState([]);

	/* Handles the changes in the input fields */
	const handleChange = (event) => {

		event.preventDefault();
		/* target holds the field information, like it's value
		 * and it's name, from which we distinguish which field it is
		 * */
		const target = event.target;
		const name = target.name;

		if (name === "length") {

			if (!isNumeric(target.value)) {
				alert("Error", "It should be a number", "error");
				return;
			} else if (parseInt(target.value) > 10) {
				alert("Error", "To big of a length", "error");
				return;
			} else {
				const array = [];
				for (let i = 0; i < students.length; i++) {
					array.push(parseInt(target.value));
				}

				setAttendedList(array);
			}

		}
		/* This updates only the `name` field of the session */
		setSession({ ...session, [name]: target.value });
	}

	/* handles submitting the session information */
	const onSubmit = async (event) => {
		event.preventDefault();
		if (session.topic === "" ||
			session.date === "" ||
			session.type === "" ||
			session.week <= 0 ||
			session.length <= 0 ||
			session.length > 10) {

			alert("Error", "Your input is wrong", "error");
			return;
		}

		const token = sessionStorage.getItem("jwt");
		const bearer = 'Bearer ' + token;
		await fetch(`${apiLink}/teachers/${teacherId}/courses/${course.id}/attendance`, {
			method: 'post',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': bearer
			},
			body: JSON.stringify(session)
		})
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					// we now use the insertId returned by our request to
					// insert the students into that session
					submitStudents(res.result.insertId);
				}
			})
	}

	/* Handles submitting the student information to the api */
	const submitStudents = async (sessionId) => {

		const body = students.map((student, key) => {
			return ({ id: student.id, length: attendedList[key] });
		});

		const token = sessionStorage.getItem("jwt");
		const bearer = 'Bearer ' + token;
		await fetch(`${apiLink}/teachers/${teacherId}/courses/${course.id}/attendance/${sessionId}`, {
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
						alert("Success!", "The session was successfully added", "success");
						history.push(`/t/${teacherId}/courses/${course.id}/attendance`);
					}
				} else {
					alert("Error", res.message, "error");
				}
			})
			.catch((err) => console.log(err));
	};

	/* generates a function for manipulating the correct element in the
	 * attended list */
	const functionGenerator = (key) => {

		const changeStudentAttended = (delta) => {

			const newArray = [...attendedList];
			const newValue = attendedList[key] + delta;

			if (newValue > session.length || newValue < 0) {
				alert("Error", "Number not allowed", "error");
				return;
			}

			newArray[key] = newValue;

			setAttendedList(newArray);
		}

		return changeStudentAttended;
	}

	return (
		<div className="add-session">
			<label>
				Week:
				<input name="week" placeholder="week" type="number" onChange={handleChange} value={session.week} />
			</label>
			<label>
				Topic:
				<input name="topic" placeholder="topic" onChange={handleChange} value={session.topic} />
			</label>
			<label>
				Type:
				<select name="type" placeholder="Type" onChange={handleChange} value={session.type}>
					<option value="lecture">Lecture</option>
					<option value="seminar">Seminar</option>
				</select>
			</label>
			<label>
				Length:
				<input name="length" type="number" placeholder="length" onChange={handleChange} value={session.length} />
			</label>
			<label>
				Date:
				<input name="date" placeholder="week" type="date" onChange={handleChange} value={session.date} />
			</label>
			<button onClick={onSubmit}>Submit</button>
			<div className="horizontal-divider"></div>
			<table>
				<thead>
					<tr>
						<th>Id</th>
						<th>Firstname</th>
						<th>Lastname</th>
						<th>Attended</th>
						<th></th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{students.map((student, key) => <StudentRow key={key} student={student} length={attendedList[key]} callback={functionGenerator(key)} />)}
				</tbody>
			</table>
		</div>
	);
}

/* Displays a table row that holds information about a student */
function StudentRow(props) {
	const student = props.student;
	const callback = props.callback;

	return (
		<tr>
			<td>{student.id}</td>
			<td>{student.firstname}</td>
			<td>{student.lastname}</td>
			<td>{typeof props.length !== "NaN" ? props.length : "Invalid"}</td>
			<td>
				<button onClick={() => callback(-1)}><i className="material-icons">remove</i></button>
			</td>
			<td>
				<button onClick={() => callback(1)}><i className="material-icons">add</i></button>
			</td>
		</tr>
	);
}

export default NewSession;
