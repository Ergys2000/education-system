import React, { useEffect, useState, useContext } from "react";
import { useHistory, useRouteMatch } from 'react-router-dom';
import apiLink from "../../API";
import { StudentContext } from "../Student";

type Student = {
	firstname: string;
	lastname: string;
	email: string;
	address: string;
	phone: string;
	age: number;
	gender: string;
	nationality: string;
	password: string
};

const Settings = () => {
	const studentId = useContext(StudentContext);
	const history = useHistory();

	/* This state is used to information about the student */
	const [student, setStudent] = useState<Student>({
		firstname: "",
		lastname: "",
		email: "",
		address: "",
		phone: "",
		age: 0,
		gender: "",
		nationality: "",
		password: ""
	});
	useEffect(() => {
		const token = sessionStorage.getItem("jwt");
		const bearer = "Bearer " + token;
		fetch(`${apiLink}/students/${studentId}`, {
			headers: {
				'Authorization': bearer
			}
		})
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					setStudent(res.result);
				} else {
					(alert as any)("Error", res.message, "error");
					history.push("/");
				}
			}).catch(_ => console.log(_));
	}, []);

	return (
		<div className="settings">
			<header>
				<h2>Settings</h2>
			</header>
			<section>
				<ProfileInfo student={student} />
				<ProfilePictureForm />
			</section>
		</div>
	);
}

/* Displays profile information about the student */
function ProfileInfo(props: { student: Student }) {
	const student = props.student;
	const history = useHistory();
	const { url } = useRouteMatch();
	return (
		<div className="profile">
			<div className="head">
				<h3>Profile information</h3>
				<button onClick={() => history.push(`${url}/profile`)}>Update</button>
			</div>
			<div className="labels">
				<p>Firstname: </p>
				<p>Lastname: </p>
				<p>Email: </p>
				<p>Address: </p>
				<p>Phone Number: </p>
				<p>Age: </p>
				<p>Gender: </p>
				<p>Nationality: </p>
			</div>
			<div className="values">
				<p>{student.firstname}</p>
				<p>{student.lastname}</p>
				<p>{student.email}</p>
				<p>{student.address}</p>
				<p>{student.phone}</p>
				<p>{student.age}</p>
				<p>{student.gender}</p>
				<p>{student.nationality}</p>
			</div>
		</div>
	);
}

const ProfilePictureForm = () => {
	const studentId = useContext(StudentContext);
	const [filename, setFilename] = useState<string|null>(null);

	const uploadImage = async (event: React.FormEvent) => {
		event.preventDefault();
		const bearer = "Bearer " + sessionStorage.getItem("jwt");
		const form = event.target;
		const formData = new FormData(form as HTMLFormElement);
		await fetch(`${apiLink}/students/${studentId}/picture`, {
			method: 'post',
			headers: {
				'Authorization': bearer
			},
			body: formData
		})
			.then(res => res.json())
			.then(res => {
        if(res.status === "OK") {
          (alert as any)("Success!", res.message, "success");
        } else {
          (alert as any)("Error", res.message, "error");
        }
			})
			.catch(err => console.log(err));
	}

	const onFileChange = (e: React.ChangeEvent) => {
		const value = (e.target as any).value;	
		const newFilename = value.split("\\").pop();
		setFilename(newFilename);
	}

  return (
    <div className="upload-picture">
      <h3>Update the profile picture</h3>
      <form onSubmit={uploadImage}>
				<label className="file">
					<i className="material-icons">{"upload"}</i>
					{filename || "Choose"}
					<input onChange={onFileChange} type="file" name="file" />
				</label>
				<button>Upload</button>
      </form>
    </div>
  );
}

export default Settings;
