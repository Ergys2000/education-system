import React, { useState, useEffect, useContext } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import apiLink from '../API';
import { AdminContext } from './Admin';


export default function NavBar() {
	const adminId = useContext(AdminContext);
	let match = useRouteMatch();

	const [focus, setFocus] = useState("home");

	const [access, setAccess] = useState("user");
	useEffect(() => {
		const fetchAdmin = async () => {
			const bearer = "Bearer " + sessionStorage.getItem("jwt");
			await fetch(`${apiLink}/admins/${adminId}/admins/${adminId}`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setAccess(res.result.access);
					} else {
						alert(res.message);
					}
				}).catch(_ => console.log(_));
		}
		fetchAdmin();
	}, [adminId]);

	return (
		<div className="sidenav">
			<Link to={`${match.url}/home`}
				className={focus === "home" ? "active" : ""}
				onClick={() => setFocus("home")}>
				<i className="material-icons">home</i>
				<p>Home</p>
			</Link>
			<Link to={`${match.url}/classes`} 
				className={focus === "classes" ? "active" : ""}
				onClick={() => setFocus("classes")}>
				<i className="material-icons">class</i>
				<p>Classes</p>
			</Link>
			<Link to={`${match.url}/schedules`}
				className={focus === "schedules" ? "active" : ""}
				onClick={() => setFocus("schedules")}>
				<i className="material-icons">view_list</i>
				<p>Schedules</p>
			</Link>
			<Link to={`${match.url}/courses`}
				className={focus === "courses" ? "active" : ""}
				onClick={() => setFocus("courses")}>
				<i className="material-icons">library_books</i>
				<p>Courses</p>
			</Link>
			<Link to={`${match.url}/events`}
				className={focus === "events" ? "active" : ""}
				onClick={() => setFocus("events")}>
				<i className="material-icons">book_online</i>
				<p>Events</p>
			</Link>
			<Link to={`${match.url}/teachers`}
				className={focus === "teachers" ? "active" : ""}
				onClick={() => setFocus("teachers")}>
				<i className="material-icons">account_box</i>
				<p>Teachers</p>
			</Link>
			<Link to={`${match.url}/students`}
				className={focus === "students" ? "active" : ""}
				onClick={() => setFocus("students")}>
				<i className="material-icons">face</i>
				<p>Students</p>
			</Link>
			<Link
				to={`${match.url}/admins`}
				onClick={() => setFocus("admins")}
				className={(access !== "supervisor" ? "hidden " : "") + (focus === "admins" ? "active" : "")}>
				<i className="material-icons">supervised_user_circle</i>
				<p>Admins</p>
			</Link>
		</div>
	);
}
