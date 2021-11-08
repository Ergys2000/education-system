import React, { useContext, useState, useEffect } from 'react';
import { useRouteMatch, useParams, Switch, Route, useHistory, Link } from 'react-router-dom';
import { AdminContext } from './Admin';
import apiLink from '../API';
import { validateEmail, validateNameString, validatePhone } from '../Utils';

type Gender = "male" | "female" | "";
interface Student {
	id?: number,
	firstname: string,
	lastname: string,
	email: string,
	password: string,
	phone: string,
	address: string,
	nationality: string,
	age: number,
	gender: Gender,
	classInstanceID: number
}

interface ClassInstance {
	name: string,
	id: number
}

/* The component that defines the students route */
const Students = () => {
	const { path } = useRouteMatch();
	return (
		<Switch>
			<Route exact path={`${path}/`}>
				<StudentList />
			</Route>
			<Route exact path={`${path}/:studentId`}>
				<StudentView />
			</Route>
		</Switch>
	);
}

/* Displays a list of students */
const StudentList = () => {
	interface Student {
		id: number,
		firstname: string,
		lastname: string
	}
	const adminId = useContext(AdminContext);

	/* The current url */
	const { url } = useRouteMatch();

	/* Getting the list of students */
	const [update, setUpdate] = useState(0);
	const [students, setStudents] = useState<Student[]>([]);
	useEffect(() => {
		const fetchStudents = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = 'Bearer ' + token;
			await fetch(`${apiLink}/admins/${adminId}/students`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => res.status === "OK" ? res.result : [])
				.then(students => {
					setStudents(students);
				}).catch(_ => alert("Something went wrong!"));
		}
		fetchStudents();
	}, [adminId, update]);

	const toggleForm = () => {
		const form = document.getElementById("add-student-form");
		const button = document.getElementById("add-student-button");
		form?.classList.toggle("hide");
		button?.classList.toggle("hide");
	}


	return (
		<div className="student-list">
			<br />
			<br />
			<button onClick={toggleForm} id="add-student-button">Add new student</button>
			<AddStudent updateList={() => setUpdate(update + 1)} toggleForm={toggleForm} />
			<table>
				<thead>
					<tr>
						<th>Id</th>
						<th>Firstname</th>
						<th>Lastname</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{students.map(student => (
						<tr key={student.id}>
							<td>{student.id}</td>
							<td>{student.firstname}</td>
							<td>{student.lastname}</td>
							<td><Link to={`${url}/${student.id}`}>VIEW</Link></td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

/* Displays the view for a single student */
const StudentView = () => {
	const adminId = useContext(AdminContext);
	const { studentId } = useParams() as any;

	/* Holds the form state about the student */
	const [student, setStudent] = useState<Student>({
		id: -1,
		firstname: "",
		lastname: "",
		email: "",
		password: "",
		address: "",
		phone: "",
		nationality: "",
		age: 0,
		gender: "",
		classInstanceID: 0
	});
	useEffect(() => {
		const fetchstudent = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = 'Bearer ' + token;
			await fetch(`${apiLink}/admins/${adminId}/students/${studentId}`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setStudent(res.result);
					} else {
						alert(res.message);
					}
				})
		}
		fetchstudent();
	}, [adminId, studentId]);

	/* Handles submitting the form information to the api
	* in this case it updates the student
	* */
	const onSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		/* Perform validations */
		if (!validateEmail(student.email)) {
			alert("Wrong email format!");
			return;
		}
		if (!validatePhone(student.phone)) {
			alert("Phone format is wrong!");
			return;
		}
		const token = sessionStorage.getItem("jwt");
		const bearer = "Bearer " + token;
		await fetch(`${apiLink}/admins/${adminId}/students/${studentId}`, {
			method: 'put',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': bearer
			},
			body: JSON.stringify(student)
		})
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					alert("student updated successfully");
				} else {
					alert(res.message);
				}
			}).catch(_ => alert("Something went wrong"));
	}

	/* Handles the changes made to the form data, performs validation */
	const handleChange = (event: React.ChangeEvent) => {
		event.preventDefault();
		const name = (event.target as any).name;
		const value = (event.target as any).value;

		/* Perform validations */
		if (name === "firstname" || name === "lastname" || name === "nationality") {
			if (!validateNameString(value)) {
				alert("Wrong values at text fields!");
				return;
			}
		}

		setStudent({ ...student, [name]: value });
	}

	const deleteStudent = async () => {
		const token = sessionStorage.getItem("jwt");
		const bearer = 'Bearer ' + token;
		await fetch(`${apiLink}/admins/${adminId}/students/${studentId}`, {
			method: 'delete',
			headers: {
				'Authorization': bearer
			}
		})
			.then(res => res.json())
			.then(res => {
				res.status === "OK"
					? alert("student deleted")
					: alert("Could not delete student. Make sure he is not responsible for any class or course!");
			})
	}

	return (
		<div className="student">
			<h2>Update profile info</h2>
			<form className="student-form" onSubmit={onSubmit}>
				<label>
					Firstname:
                        <input type='text' name="firstname" value={student.firstname} onChange={handleChange} />
				</label>
				<label>
					Lastname:
                        <input type='text' name="lastname" value={student.lastname} onChange={handleChange} />
				</label>
				<label>
					Email:
                        <input type='email' name="email" value={student.email} onChange={handleChange} />
				</label>
				<label>
					Password:
                        <input type='text' name="password" value={student.password} onChange={handleChange} />
				</label>
				<label>
					Phone:
                        <input type='text' name="phone" value={student.phone} onChange={handleChange} />
				</label>
				<label>
					Address:
                        <input type='text' name="address" value={student.address} onChange={handleChange} />
				</label>
				<label>
					Nationality:
                        <input type='text' name="nationality" value={student.nationality} onChange={handleChange} />
				</label>
				<label>
					Age:
                        <input type='number' name="age" value={student.age} onChange={handleChange} min={18} max={100} step={1} />
				</label>
				<label>
					Gender:
                        <input type='text' name="gender" value={student.gender} onChange={handleChange} />
				</label>
				<button>Update</button>
			</form>
			<br />
			<br />
			<br />
			<button className="danger" onClick={deleteStudent}>Delete student</button>
		</div>
	);
}

/* The form that handles adding a new student */
const AddStudent = (props: { updateList: () => void, toggleForm: () => void }) => {
	const adminId = useContext(AdminContext);

	const [student, setStudent] = useState<Student>({
		firstname: "",
		lastname: "",
		email: "",
		password: "",
		phone: "",
		address: "",
		nationality: "",
		age: 18,
		gender: "male",
		classInstanceID: 0
	});

	const [classInstances, setClassInstances] = useState<ClassInstance[]>([]);
	useEffect(() => {
		const fetchClasses = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = 'Bearer ' + token;
			await fetch(`${apiLink}/admins/${adminId}/classInstances`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setClassInstances(res.result);
					} else {
						alert(res.message);
					}
				});
		}
		fetchClasses();
	}, [adminId]);

	const handleChange = (event: React.ChangeEvent) => {
		event.preventDefault();
		const name = (event.target as any).name
		const value = (event.target as any).value
		/* Perform validations */
		if (name === "firstname" || name === "lastname" || name === "nationality") {
			if (!validateNameString(value)) {
				alert("Wrong values at text fields!");
				return;
			}
		}
		setStudent({ ...student, [name]: value });
	}

	const onSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		/* Perform validations */
		if (!validateEmail(student.email)) {
			alert("Wrong email format!");
			return;
		}

		let nonEmptyValues = ["firstname", "lastname", "email", "password"];
		for (const [key, value] of Object.entries(student)) {
			if (value === "" && nonEmptyValues.includes(key)) {
				alert("You cannot have empty values!");
				return;
			}
		}
		const token = sessionStorage.getItem("jwt");
		const bearer = 'Bearer ' + token;
		await fetch(`${apiLink}/admins/${adminId}/students`, {
			method: 'post',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': bearer
			},
			body: JSON.stringify(student)
		})
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					alert("Student added!");
					props.updateList();
					props.toggleForm();
				} else {
					alert(res.message);
					props.toggleForm();
				}
			}).catch(_ => alert("Something went wrong!"));
	}


	const cancel = (event: React.MouseEvent) => {
		event.preventDefault();
		props.toggleForm();
	}


	return (
		<form onSubmit={onSubmit} id="add-student-form" className="hide">
			<h2>Add a student</h2>
			<label>
				Firstname:
                <input type='text' name="firstname" value={student.firstname} onChange={handleChange} />
			</label>
			<label>
				Lastname:
                <input type='text' name="lastname" value={student.lastname} onChange={handleChange} />
			</label>
			<label>
				Email:
                <input type='email' name="email" value={student.email} onChange={handleChange} />
			</label>
			<label>
				Password:
                <input type='text' name="password" value={student.password} onChange={handleChange} />
			</label>
			<label>
				Phone:
                <input type='text' name="phone" value={student.phone} onChange={handleChange} />
			</label>
			<label>
				Address:
                <input type='text' name="address" value={student.address} onChange={handleChange} />
			</label>
			<label>
				Nationality:
                <input type='text' name="nationality" value={student.nationality} onChange={handleChange} />
			</label>
			<label>
				Age:
                <input type='number' name="age" value={student.age} onChange={handleChange} min={5} max={100} step={1} />
			</label>
			<label>
				Gender:
				<select
					name="gender"
					value={student.gender}
					onChange={handleChange}>
					<option value={"male"}>Male</option>
					<option value={"female"}>Female</option>
				</select>
			</label>
			<label>
				Class:
				<select
					name="classInstanceID"
					value={student.classInstanceID}
					onChange={handleChange}>
					<option value={0}>Choose one</option>
					{classInstances.map(ci => <option key={ci.id} value={ci.id}>{ci.name}</option>)}
				</select>
			</label>
			<button type="submit">Add student</button>
			<button onClick={cancel}>Cancel</button>
		</form>
	);
}

export default Students;
