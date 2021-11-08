import React, { useEffect, useState, useContext } from 'react';
import { Link, Route, Switch, useRouteMatch } from 'react-router-dom';
import Course from './Course';
import apiLink from "../../API";
import { StudentContext } from "../Student";
import { getColorForCourse } from '../../Utils';

/* Displays the courses page */
function Courses(props) {
  let { path } = useRouteMatch();

  return (
    <div className="courses-page">
      <header>
        <h2>Courses</h2>
      </header>
      <section>
        <Switch>
          <Route exact path={`${path}/`} >
            <CourseList />
          </Route>
          <Route path={`${path}/:courseId`} >
            <Course />
          </Route>
        </Switch>
      </section>
    </div>
  );
}

/* Displays the list of courses */
function CourseList(props) {
  const studentId = useContext(StudentContext);
  const [courses, setCourses] = useState([]);
  useEffect(() => {

    const fetchCourses = async () => {
      const token = sessionStorage.getItem("jwt");
      const bearer = 'Bearer ' + token;

      await fetch(`${apiLink}/students/${studentId}/courses`, {
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
            <th>TEACHER</th>
            <th>LAST GRADE</th>
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
  const studentId = useContext(StudentContext);

  /* This state and useEffect function are used to get the hours per week and
   * last grade for each course */
  const [hoursPerWeek, setHoursPerWeek] = useState(0);
  const [lastGrade, setLastGrade] = useState(null);
  useEffect(() => {
    /* Get hours per week */
    const fetchHoursPerWeek = async () => {
      const bearer = "Bearer " + sessionStorage.getItem("jwt");
      await fetch(`${apiLink}/students/${studentId}/courses/${props.course.id}/hours`, {
        headers: {
          'Authorization': bearer
        }
      })
        .then(res => res.json())
        .then(res => {
          if (res.status === "OK") {
            setHoursPerWeek(res.result);
          } else {
            console.log(res.message);
          }
        }).catch(err => console.log(err));
    }

    /* Get last grade */
    const fetchLastGrade = async () => {
      const bearer = "Bearer " + sessionStorage.getItem("jwt");
      await fetch(`${apiLink}/students/${studentId}/courses/${props.course.id}/lastgrade`, {
        headers: {
          'Authorization': bearer
        }
      })
        .then(res => res.json())
        .then(res => {
          if (res.status === "OK") {
            setLastGrade(res.result);
          } else {
            console.log(res.message);
          }
        }).catch(err => console.log(err));
    }

    fetchHoursPerWeek();
    fetchLastGrade();

  }, [studentId, props.course.id]);

  return (
    <tr>
      <td className="color">
        <div style={{ backgroundColor: getColorForCourse(props.course.id) }}></div>
      </td>
      <td className="name">{props.course.name}</td>
      <td className="category">{props.course.category}</td>
      <td className="hours">{hoursPerWeek}</td>
      <td className="teacher">{props.course.teacher}</td>
      <td className="grade">{lastGrade ? lastGrade : "No grades yet"}</td>
      <td><Link to={`${url}/${props.course.id}`}>View</Link></td>
    </tr>
  );
}

export default Courses;
