import React, { useEffect, useState, useContext } from 'react';
import { Link, Route, Switch, useRouteMatch } from 'react-router-dom';
import Course from './Course';
import apiLink from "../../API";
import { TeacherContext } from "../Teacher";
import { getColorForCourse } from '../../Utils';


function Courses(_props) {
	let { path } = useRouteMatch();

	return (
		<div className="courses-page">
			<header><h2>Courses</h2></header>
			<section>
				<Switch>
					<Route exact path={`${path}/`} >
						<CourseList />
					</Route>
					<Route path={`${path}/:courseId`}>
						<Course />
					</Route>
				</Switch>
			</section>
		</div>
	);
}

function CourseList(_props) {
	const teacherId = useContext(TeacherContext);
	const [courses, setCourses] = useState([]);
	useEffect(() => {

		const fetchCourses = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = 'Bearer ' + token;

			await fetch(`${apiLink}/teachers/${teacherId}/courses`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setCourses(res.result);
					} else {
						alert("Error", res.message, "error");
					}
				}).catch(_ => console.log(_));
		}
		fetchCourses();

	}, []);
	return (
		<div className="courses-list">
			<table>
				<thead>
					<tr>
						<th></th>
						<th>COURSE</th>
						<th>CATEGORY</th>
						<th>HOURS PER WEEK</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{courses.map(x => <CourseListItem key={x.id} course={x} />)}
				</tbody>
			</table>
		</div>
	);
}

const CourseListItem = (props) => {
	const { url } = useRouteMatch();
	const teacherId = useContext(TeacherContext);

	const [hoursPerWeek, setHoursPerWeek] = useState(0);
	useEffect(() => {
		const fetchInfo = async () => {
			const bearer = "Bearer " + sessionStorage.getItem("jwt");
			await fetch(`${apiLink}/teachers/${teacherId}/courses/${props.course.id}/hours`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if(res.status === "OK") {
						setHoursPerWeek(res.result);
					} else {
            alert("Error!", res.message, "error");
					}
				}).catch(err => console.log(err));
		}

		fetchInfo();
	}, [teacherId]);

	return (
		<tr>
			<td className="color">
        <div style={{backgroundColor: getColorForCourse(props.course.id)}}></div>
      </td>
			<td className="name">{props.course.name}</td>
			<td className="category">{props.course.category}</td>
			<td className="hours">{hoursPerWeek}</td>
			<td><Link to={`${url}/${props.course.id}`}>View</Link></td>
		</tr>
	);
}

export default Courses;
