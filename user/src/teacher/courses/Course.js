import React, { useEffect, useState, useContext } from 'react';
import { Link, useParams, useRouteMatch, Route, Switch, Redirect } from 'react-router-dom';

import PostList from './PostList';
import FileList from './FileList';

import { AssignmentList, Assignment } from './Assignments';

import Attendance from './Attendance';
import Session from './AttendanceSession';
import AddSession from './AddSession';

import Grades from './Grades';
import AddGrades, { AddSingleGrade } from './AddGrades';
import { ModifyGrade, DeleteGrade } from './UpdateGrades';

import Register from './Register';

import { TeacherContext } from "../Teacher";
import apiLink from "../../API";

/* Create and export the course context */
export const CourseContext = React.createContext({});

function Course(props) {
  const teacherId = useContext(TeacherContext);
  const { courseId } = useParams();
  const { url, path } = useRouteMatch();

  const [course, setCourse] = useState({});
  useEffect(() => {
    const token = sessionStorage.getItem("jwt");
    const bearer = "Bearer " + token;
    const fetchCourse = async () => {
      await fetch(`${apiLink}/teachers/${teacherId}/courses/${courseId}`, {
        headers: { 'Authorization': bearer }
      })
        .then(res => res.json())
        .then(res => {
          if (res.status === "OK") {
            setCourse(res.result);
          } else {
            alert("Error", res.message, "error");
          }
        }).catch(_ => console.log(_));
    }
    fetchCourse();
  }, [teacherId, courseId]);

  return (
    <CourseContext.Provider value={course}>
      <div className="course">

        <NavBar courseId={courseId} teacherId={teacherId} />
        <div className="course-tab">

          <Switch>

            <Route exact path={`${path}/`}>
              <Redirect to={`${url}/posts`} />
            </Route>

            <Route exact path={`${path}/posts`}>
              <PostList />
            </Route>

            {/*Assignments routes*/}
            <Route exact path={`${path}/assignments`}>
              <AssignmentList />
            </Route>
            <Route exact path={`${path}/assignments/:assignmentId`}>
              <Assignment />
            </Route>

            {/*General course files route*/}
            <Route exact path={`${path}/files`}>
              <FileList />
            </Route>

            {/*Attendance routes*/}
            <Route exact path={`${path}/attendance`} >
              <Attendance />
            </Route>
            <Route exact path={`${path}/attendance/add`} >
              <AddSession />
            </Route>
            <Route path={`${path}/attendance/:sessionId`} >
              <Session />
            </Route>

            <Route exact path={`${path}/register`} >
              <Register />
            </Route>

            {/* The grade routes*/}
            <Route exact path={`${path}/grades`} >
              <Grades />
            </Route>
            <Route exact path={`${path}/grades/add`} >
              <AddGrades />
            </Route>
            <Route exact path={`${path}/grades/addsingle`} >
              <AddSingleGrade />
            </Route>
            <Route exact path={`${path}/grades/delete`} >
              <DeleteGrade />
            </Route>
            <Route exact path={`${path}/grades/:gradeId`} >
              <ModifyGrade />
            </Route>

          </Switch>
        </div>
      </div>
    </CourseContext.Provider>
  );
}

function NavBar(props) {
  const course = useContext(CourseContext);

  const { url } = useRouteMatch();

  const [onFocus, setFocus] = useState("posts");

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
        <li className={onFocus === "attendance" ? "active" : ""}>
          <Link
            to={`${url}/attendance`}
            onClick={() => setFocus("attendance")}
          >Attendance</Link>
        </li>
        <li className={onFocus === "grades" ? "active" : ""}>
          <Link
            to={`${url}/grades`}
            onClick={() => setFocus("grades")}
          >Grades</Link>
        </li>
        <li className={onFocus === "register" ? "active" : ""}>
          <Link
            to={`${url}/register`}
            onClick={() => setFocus("register")}
          >Register</Link>
        </li>
      </ul>
    </div>
  );
}

export default Course;
