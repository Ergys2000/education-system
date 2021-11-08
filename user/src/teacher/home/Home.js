import React, { useEffect, useState, useContext } from "react";
import { useHistory } from 'react-router-dom';
import apiLink from "../../API";
import { TeacherContext } from "../Teacher";
import Events from "../../shared/Events";

/* This component displays the whole home page */
function Home(_props) {
  const teacherId = useContext(TeacherContext);
  /* This state is used to information about the teacher */
  const [teacher, setTeacher] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("jwt");
    const bearer = "Bearer " + token;
    fetch(`${apiLink}/teachers/${teacherId}`, {
      headers: {
        'Authorization': bearer
      }
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === "OK") {
          setTeacher(res.result);
        } else {
          alert("Error", res.message, "error");
        }
      }).catch(_ => console.log(_));
  }, [teacherId]);

  return (
    <div className="home">
      <header>
        <h2>Home</h2>
      </header>
      <section>
        <div className="dashboard">
          <Events eventsApiLink={`${apiLink}/teachers/${teacherId}/events`} />
          <div className="personal">
            <ProfileInfo teacher={teacher} />
            <ProfilePictureForm />
          </div>
        </div>
      </section>
    </div>

  );
}

/* Displays profile information about the teacher */
function ProfileInfo(props) {
  const teacher = props.teacher ? props.teacher : {};
  const history = useHistory();
  return (
    <div className="profile">
      <div className="head">
        <h3>Profile information</h3>
        <button onClick={() => history.push('home/profile')}>Update</button>
      </div>
      <div className="labels">
        <p>Name: </p>
        <p>Surname: </p>
        <p>Email: </p>
        <p>Address: </p>
        <p>Number: </p>
      </div>
      <div className="values">
        <p>{teacher.firstname}</p>
        <p>{teacher.lastname}</p>
        <p>{teacher.email}</p>
        <p>{teacher.address}</p>
        <p>{teacher.phone}</p>
      </div>
    </div>
  );
}

/* Updates the profile picture */
const ProfilePictureForm = () => {
  const teacherId = useContext(TeacherContext);
	const [filename, setFilename] = useState(null);

  const uploadImage = async (event) => {
    event.preventDefault();
    const bearer = "Bearer " + sessionStorage.getItem("jwt");
    const form = event.target;
    const formData = new FormData(form);
    await fetch(`${apiLink}/teachers/${teacherId}/picture`, {
      method: 'post',
      headers: {
        'Authorization': bearer
      },
      body: formData
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === "OK") {
          alert("Success!", res.message, "success");
        } else {
          alert("Error", res.message, "error");
        }
      })
      .catch(err => console.log(err));
  }

	const onFileChange = (e) => {
		const value = e.target.value;	
		const newFilename = value.split("\\").pop();
		setFilename(newFilename);
	}

  return (
    <div className="upload-picture">
      <h3>Update the profile picture</h3>
      <form onSubmit={uploadImage}>
				<label className="file">
					<i className="material-icons">upload</i>
					{filename || "Choose"}
					<input onChange={onFileChange} type="file" name="file" />
				</label>
				<button>Upload</button>
      </form>
    </div>
  );
}

export default Home;
