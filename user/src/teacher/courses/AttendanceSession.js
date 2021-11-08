import { useEffect, useState, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";
import apiLink from "../../API";
import { TeacherContext } from "../Teacher";
import { CourseContext } from "./Course";

const Session = (props) => {
	const teacherId = useContext(TeacherContext);
	const course = useContext(CourseContext);
	const { sessionId } = useParams();
	const [students, setStudents] = useState([]);
	const history = useHistory();

	useEffect(() => {
		const fetchStudents = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = 'Bearer ' + token;

			fetch(`${apiLink}/teachers/${teacherId}/courses/${course.id}/attendance/${sessionId}`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setStudents(res.result);
					} else {
						alert("Error", res.message, "error");
					}
				}).catch(_ => console.log(_));
		}
		fetchStudents();
	}, []);

	const deleteSession = (event) => {
		event.preventDefault();

		const token = sessionStorage.getItem("jwt");
		const bearer = 'Bearer ' + token;

		fetch(`${apiLink}/teachers/${teacherId}/courses/${course.id}/attendance/${sessionId}`, {
			method: 'delete',
			headers: {
				'Authorization': bearer
			}
		})
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					alert("Success!", res.message, "success");
				} else {
					alert("Error", res.message, "error");
				}
				history.goBack();
			}).catch(_ => console.log(_));

	}

	return (
		<div className="session">
			<button className="delete" onClick={deleteSession}>Delete this session</button>
			<table>
				<thead>
					<tr>
						<th>Firstname</th>
						<th>Lastname</th>
						<th>Attended</th>
						<th></th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{students.map(student => <StudentRow key={student.id} student={student} />)}
				</tbody>
			</table>
		</div>
	);
}

function StudentRow(props) {

	const teacherId = useContext(TeacherContext);
	const course = useContext(CourseContext);

	const { sessionId } = useParams();

	const [student, setStudent] = useState(props.student);

	const incButton = async () => {
		if (student.attended == student.total) {
			alert("Error", "You cannot increase any more!", "error");
			return;
		}
		const token = sessionStorage.getItem("jwt");
		const bearer = 'Bearer ' + token;

		await fetch(`${apiLink}/teachers/${teacherId}/courses/${course.id}/attendance/${sessionId}/${student.id}`, {

			method: "post",
			headers: {
				'Content-Type': 'application/json',
				'Authorization': bearer
			},
			body: JSON.stringify({ length: student.attended + 1 })

		})
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					alert("Success!", res.message, "success");
				} else {
					alert("Error", res.message, "error");
				}
				setStudent({ ...student, attended: student.attended + 1 });
			});
	}

	const decButton = async () => {
		if (student.attended == 0) {
			alert("Error", "You cannot decrease any more!", "error");
			return;
		}
		const token = sessionStorage.getItem("jwt");
		const bearer = 'Bearer ' + token;

		await fetch(`${apiLink}/teachers/${teacherId}/courses/${course.id}/attendance/${sessionId}/${student.id}`, {

			method: "post",
			headers: {
				'Content-Type': 'application/json',
				'Authorization': bearer
			},
			body: JSON.stringify({ length: student.attended - 1 })

		})
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					alert("Success!", res.message, "success");
				} else {
					alert("Error", res.message, "error");
				}
				setStudent({ ...student, attended: student.attended - 1 });
			});
	}

	return (
		<tr>
			<td>{student.firstname}</td>
			<td>{student.lastname}</td>
			<td>{student.attended + " / " + student.total}</td>
			<td>
				<button onClick={decButton}><i className="material-icons">remove</i></button>
			</td>
			<td>
				<button onClick={incButton}><i className="material-icons">add</i></button>
			</td>
		</tr>
	);
}

export default Session;
