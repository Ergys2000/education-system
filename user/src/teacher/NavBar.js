import React, { useState, useEffect, useContext } from 'react';
import { Link, useRouteMatch, useHistory } from 'react-router-dom';
import apiLink from '../API';
import {TeacherContext} from './Teacher';


export default function NavBar() {
  const teacherId = useContext(TeacherContext);
  let match = useRouteMatch();
  const history = useHistory();

  const [onFocus, setFocus] = useState("home");

  const logout = (event) => {
    event.preventDefault();
    sessionStorage.setItem("jwt", "");
    history.push("/");
  }

  const [fullName, setFullName] = useState("");
  useEffect(() => {
    const fetchTeacher = async () => {
      const bearer = "Bearer " + sessionStorage.getItem("jwt");
      await fetch(`${apiLink}/teachers/${teacherId}`, {
        headers: {
          'Authorization': bearer
        }
      }).then(res => res.json())
        .then(res => {
          if(res.status === "OK") {
            setFullName(res.result.firstname + " " + res.result.lastname);
          } else {
            console.log(res.message);
          }
        }).catch(err => console.log(err));
    }
    fetchTeacher();
  }, [teacherId]);

  return (
    <div className="sidenav">
      <div className="profile">
        {/* TODO: Write an onerror function for the image */}
        <img src={`${apiLink}/teachers/${teacherId}/picture`}/>
        <h5>{fullName}</h5>
      </div>
      <Link to={`${match.url}/home`}
        onClick={() => setFocus("home")}
        className={onFocus === "home" ? "active" : ""}
      >
        <i className="material-icons">home</i>
        <p>Home</p>
      </Link>

      <Link to={`${match.url}/class`}
        onClick={() => setFocus("class")}
        className={onFocus === "class" ? "active" : ""}
      >
        <i className="material-icons">face</i>
        <p>My class</p>
      </Link>

      <Link to={`${match.url}/courses`}
        onClick={() => setFocus("courses")}
        className={onFocus === "courses" ? "active" : ""}
      >
        <i className="material-icons">description</i>
        <p>My Courses</p>
      </Link>

      <Link to={`${match.url}/schedule`}
        onClick={() => setFocus("schedule")}
        className={onFocus === "schedule" ? "active" : ""}
      >
        <i className="material-icons">schedule</i>
        <p>Schedule</p>
      </Link>

      <Link to={`/`} onClick={ logout } className="logout">
        <i className="material-icons">logout</i>
        <p>Log out</p>
      </Link>
    </div>
  );
}
