import React, { useState, useEffect, useContext } from 'react';
import { Link, useRouteMatch, useHistory } from 'react-router-dom';
import apiLink from '../API';
import { StudentContext } from './Student';

export default function NavBar() {
  const studentId = useContext(StudentContext);
  const [onFocus, setFocus] = useState("home");

  const history = useHistory();
  let match = useRouteMatch();

  const logout = (event) => {
    event.preventDefault();
    sessionStorage.setItem("jwt", "");
    history.push("/");
  }

  const [fullName, setFullName] = useState("");
  useEffect(() => {
    const fetchStudent = async () => {
      const bearer = "Bearer " + sessionStorage.getItem("jwt");
      await fetch(`${apiLink}/students/${studentId}`, {
        headers: {
          'Authorization': bearer
        }
      }).then(res => res.json())
        .then(res => {
          if (res.status === "OK") {
            setFullName(res.result.firstname + " " + res.result.lastname);
          } else {
            console.log(res.message);
          }
        }).catch(err => console.log(err));
    }
    fetchStudent();
  }, [studentId]);

  return (
    <div className="sidenav">

      <ProfilePicture fullName={fullName} />

      <Link to={`${match.url}/home`}
        onClick={() => setFocus("home")}
        className={onFocus === "home" ? "active" : ""}
      >
        <i className="material-icons">home</i>
        <p>Home</p>
      </Link>

      <Link to={`${match.url}/schedule`}
        onClick={() => setFocus("schedule")}
        className={onFocus === "schedule" ? "active" : ""}
      >
        <i className="material-icons">schedule</i>
        <p>Schedule</p>
      </Link>

      <Link to={`${match.url}/courses`}
        onClick={() => setFocus("courses")}
        className={onFocus === "courses" ? "active" : ""}
      >
        <i className="material-icons">description</i>
        <p>Courses</p>
      </Link>

      <Link to={`${match.url}/settings`}
        onClick={() => setFocus("settings")}
        className={onFocus === "settings" ? "active" : ""}
      >
        <i className="material-icons">settings</i>
        <p>Settings</p>
      </Link>

      <Link to={`/`} onClick={logout} className="logout">
        <i className="material-icons">logout</i>
        <p>Log out</p>
      </Link>
    </div>
  );
}

const ProfilePicture = ({ fullName }) => {
  const studentId = useContext(StudentContext);
  return (
    <div className="profile">
      <div className="profile__picture">
        <img src={`${apiLink}/students/${studentId}/picture`} />
      </div>
      <h5>{fullName}</h5>
    </div>
  );
}
