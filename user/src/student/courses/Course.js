import React, { useEffect, useState, useContext } from 'react';
import { useParams, useRouteMatch, Switch, Route, Link, Redirect } from 'react-router-dom';
import PostList from './PostList';
import { FileList } from './FileList';
import { AssignmentList, Assignment } from './Assignments';
import Attendance from './Attendance';
import Grades from './Grades';
import apiLink from "../../API";
import { StudentContext } from "../Student";

export const CourseContext = React.createContext({});

function Course(props) {
	const studentId = useContext(StudentContext);
	const { courseId } = useParams();
	const { path, url } = useRouteMatch();

	const [course, setCourse] = useState({});
	useEffect(() => {
		const fetchCourse = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = "Bearer " + token;
			await fetch(`${apiLink}/students/${studentId}/courses/${courseId}`, {
				headers: {'Authorization': bearer}
			})
				.then(res => res.json())
				.then(res => {
					if(res.status === "OK") {
						setCourse(res.result);
					} else {
						alert("Error", res.message, "error");
					}
				}).catch(_ => console.log(_));
		}
		fetchCourse();
	}, [studentId, courseId]);

	return (
		<CourseContext.Provider value={course}>
			<div className="course">
				<NavBar />

				<Switch>

					<Route exact path={`${path}/`}>
						<Redirect to={`${url}/posts`} />
					</Route>

					<Route exact path={`${path}/posts`}>
						<PostList />
					</Route>

					<Route exact path={`${path}/attendance`}>
						<Attendance />
					</Route>

					<Route exact path={`${path}/assignments`}>
						<AssignmentList />
					</Route>

					<Route exact path={`${path}/assignments/:assignmentId`}>
						<Assignment />
					</Route>

					<Route exact path={`${path}/files`}>
						<FileList />
					</Route>

					<Route exact path={`${path}/grades`}>
						<Grades />
					</Route>

				</Switch>
			</div>
		</CourseContext.Provider>
	);
}

function NavBar(props) {
	const { url } = useRouteMatch();
	const course = useContext(CourseContext);

	const [onFocus, setFocus] = useState("home");


	return (
		<div className="navbar">
			<h1>{course.name}</h1>
			<ul>
        <li className={onFocus === "posts" ? "active" : ""}>
					<Link
						to={`${url}/posts`}
						onClick={() => setFocus("posts")}
					>Posts</Link>
				</li>
        <li className={onFocus === "assignments" ? "active" : ""}>
					<Link
						to={`${url}/assignments`}
						onClick={() => setFocus("assignments")}
					>Assignments</Link>
				</li>
        <li className={onFocus === "files" ? "active" : ""}>
					<Link
						to={`${url}/files`}
						onClick={() => setFocus("files")}
					>Materials</Link>
				</li>
        <li className={onFocus === "grades" ? "active" : ""}>
					<Link
						to={`${url}/grades`}
						onClick={() => setFocus("grades")}
					>Grades</Link>
				</li>
        <li className={onFocus === "attendance" ? "active" : ""}>
					<Link
						to={`${url}/attendance`}
						onClick={() => setFocus("attendance")}
					>Attendance</Link>
				</li>
			</ul>
		</div>
	);
}

export default Course;
