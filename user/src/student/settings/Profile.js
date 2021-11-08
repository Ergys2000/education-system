import { useContext, useState, useEffect } from 'react';
import { StudentContext } from '../Student';
import { validateEmail, validateNameString, validatePhone } from '../../Utils';
import apiLink from '../../API';

/* Controlled component for updating info about the teacher */
function Profile(props) {
	const studentId = useContext(StudentContext);

	/* This state will hold info about the form entered so far
	 * We use the useEffect hook to connect to the database and get the
	 * current info about the student, then the student can modify them
	 * */
	const [student, setStudent] = useState({
		firstname: "",
		lastname: "",
		email: "",
		address: "",
		phone: ""
	});
	useEffect(() => {
		const fetchStudent = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = "Bearer " + token;
			await fetch(`${apiLink}/students/${studentId}`, {
				headers: { 'Authorization': bearer }
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setStudent(res.result);
					} else {
						alert("Error", res.message, "error");
					}
				}).catch(_ => console.log(_));
		}
		fetchStudent();
	}, [studentId]);

	/* This function is used for handling form changes */
	const handleChange = (event) => {
		event.preventDefault();

		const target = event.target;
		/* The name of the input field that has changed */
		const name = target.name;
		/* The changed value of the input field */
		const value = target.value;

		/* Perform validations */
		if (name === "firstname" || name === "lastname") {
			if (!validateNameString(value)) {
				alert("Error", `The firstname and lastname fields should only containt letters, and be no longer than 30 characters`, "error");
				return;
			}
		}

		/* Update the state if all the validations were successful */
		setStudent({ ...student, [name]: value });
	}

	/* This functions submits the information to the api and handles the
	 * response */
	const onSubmit = async (event) => {
		event.preventDefault();

		/* Check the integrity of email and phone number fields */
		if (!validateEmail(student.email)) {
			alert("Error", "Invalid email", "error");
			return;
		} else if (!validatePhone(student.phone)) {
			alert("Error", "Invalid phone number", "error");
			return;
		}

		/* Set up the request */
		const token = sessionStorage.getItem("jwt");
		const bearer = "Bearer " + token;
		await fetch(`${apiLink}/students/${studentId}`, {
			method: 'put',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': bearer
			},
			body: JSON.stringify(student)
		})
			.then(res => res.json())
			.then(res => {
				return res;
			})
			.then(res => res.status === "OK" ? res.result : null)
			.then(result => {
				if (result) {
					result.affectedRows === 1
						? alert("Success", "Student updated successfully", "success")
						: alert("Error", "Something went wrong, pleasy try again", "error");
				} else throw new Error("Student could not update due to an internal error");
			}).catch(err => console.log(err.message));
	}


	return (
		<div className="user-form">
			<header>
				<h2>Your Information</h2>
			</header>
			<section>
				<h2>Update profile info</h2>
				<form className="student-form" onSubmit={onSubmit}>
					<label>
						Firstname:
					<input onChange={handleChange} name="firstname" value={student.firstname} />
					</label>
					<label>
						Lastname:
					<input onChange={handleChange} name="lastname" value={student.lastname} />
					</label>
					<label>
						Email:
					<input type="email" onChange={handleChange} name="email" value={student.email} />
					</label>
					<label>
						Address:
					<input onChange={handleChange} name="address" value={student.address} />
					</label>
					<label>
						Phone number:
					<input onChange={handleChange} name="phone" value={student.phone} />
					</label>
					<button>Update</button>
				</form>
			</section>
		</div>
	);
}

export default Profile;
