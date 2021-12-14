import React, { useEffect, useState, useContext } from 'react';
import { useHistory, useRouteMatch, Link } from 'react-router-dom';
import apiLink from "../../API";
import { TeacherContext } from "../Teacher";
import { CourseContext } from "./Course";

function Attendance(props) {
	const teacherId = useContext(TeacherContext);
	const course = useContext(CourseContext);
	const { url } = useRouteMatch();

	const [sessions, setSessions] = useState([]);
	useEffect(() => {
		const fetchSessions = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = 'Bearer ' + token;

			await fetch(`${apiLink}/teachers/${teacherId}/courses/${course.id}/attendance`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setSessions(res.result);
					} else {
						alert("Error", res.message, "error");
					}
				}).catch(_ => console.log(_));
		}
		fetchSessions();
	}, [teacherId, course.id]);

	return (
		<div className="sessions">
			<Link to={`${url}/add`}>Add Session</Link>
			<table>
				<thead>
					<tr>
						<th>Topic</th>
						<th>Type</th>
						<th>Date</th>
						<th>Hours</th>
						<th></th>
						<th>Export to Excel</th>
					</tr>
				</thead>
				<tbody>
					{sessions.map(session => <SessionRow key={session.id} session={session} />)}
				</tbody>
			</table>
		</div>
	);
}

function SessionRow({ session }) {
	const teacherId = useContext(TeacherContext);
	const course = useContext(CourseContext);

	const history = useHistory();
	function onClick() {
		history.push(`attendance/${session.id}`);
	}
	let dateString = '';
	try {
		dateString = new Date(session.date).toDateString();
	} catch (err) {
		dateString = session.date;
	}
	function exportToExcel(event) {
		event.preventDefault();
		const downloadUrl =
			`${apiLink}/teachers/${teacherId}/courses/${course.id}/attendanceExcel/${session.id}`;
		window.open(downloadUrl, '_blank');
	}
	return (
		<tr>
			<td>{session.topic}</td>
			<td>{session.type}</td>
			<td>{dateString}</td>
			<td>{session.total}</td>
			<td><button onClick={onClick}>VIEW</button></td>
			<td><button onClick={exportToExcel}><i className="material-icons">description</i></button></td>
		</tr>
	)
}


export default Attendance;
