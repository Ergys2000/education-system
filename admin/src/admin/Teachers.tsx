import React, { useContext, useState, useEffect } from 'react';
import { useRouteMatch, useParams, Switch, Route, useHistory, Link } from 'react-router-dom';
import { AdminContext } from './Admin';
import apiLink from '../API';
import { validateEmail, validateNameString, validatePhone, validateGender } from '../Utils';

type Gender = "male" | "female";
interface Teacher {
	id?: number
	firstname: string
	lastname: string
	email: string
	password: string
	phone: string
	nationality: string
	address: string
	age: number
	gender: Gender
}

/* Defines the teacher route */
const Teachers = () => {
	const { path } = useRouteMatch();
	return (
		<div>
			<Switch>
				<Route exact path={`${path}/`}>
					<TeacherList />
				</Route>
				<Route exact path={`${path}/:teacherId`}>
					<TeacherView />
				</Route>
			</Switch>
		</div>
	);
}

/* Displays the list of all teachers */
const TeacherList = () => {
	interface Teacher {
		id: number,
		firstname: string,
		lastname: string
	}
	const adminId = useContext(AdminContext);

	/* Browser history and the current url */
	const { url } = useRouteMatch();

	/* Getting the list of teachers */
	const [update, setUpdate] = useState(0);
	const [teachers, setTeachers] = useState<Teacher[]>([]);
	useEffect(() => {
		const fetchTeachers = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = 'Bearer ' + token;
			await fetch(`${apiLink}/admins/${adminId}/teachers`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => res.status === "OK" ? res.result : [])
				.then(teachers => {
					setTeachers(teachers);
				}).catch(_ => alert("Something went wrong!"));
		}
		fetchTeachers();
	}, [adminId, update]);

	const toggleForm = () => {
		const form = document.getElementById("add-teacher-form");
		const button = document.getElementById("add-teacher-button");
		form?.classList.toggle("hide");
		button?.classList.toggle("hide");
	}

	return (
		<div className="teacher-list">
			<br />
			<br />
			<button onClick={toggleForm} id="add-teacher-button">Add new teacher</button>
			<AddTeacher updateList={() => setUpdate(update + 1)} toggleForm={toggleForm} />
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
					{teachers.map(teacher => (
						<tr key={teacher.id}>
							<td>{teacher.id}</td>
							<td>{teacher.firstname}</td>
							<td>{teacher.lastname}</td>
							<td><Link to={`${url}/${teacher.id}`}>VIEW</Link></td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

/* Displays the update page for a single teacher */
const TeacherView = () => {
	const adminId = useContext(AdminContext);
	const { teacherId } = useParams() as any;

	/* Holds the form state about the teacher */
	const [teacher, setTeacher] = useState<Teacher>({
		id: -1,
		firstname: "",
		lastname: "",
		email: "",
		password: "",
		address: "",
		phone: "",
		nationality: "",
		age: 0,
		gender: "male"
	});
	useEffect(() => {
		const fetchTeacher = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = 'Bearer ' + token;
			await fetch(`${apiLink}/admins/${adminId}/teachers/${teacherId}`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setTeacher(res.result);
					} else {
						alert(res.message);
					}
				}).catch(err => console.log(err));
		}
		fetchTeacher();
	}, [adminId, teacherId]);

	/* Handles submitting the form information to the api
	* in this case it updates the teacher
	* */
	const onSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		/* Perform validations */
		if (!validateEmail(teacher.email)) {
			alert("Wrong email format!");
			return;
		}
		if (!validatePhone(teacher.phone)) {
			alert("Phone format is wrong!");
			return;
		}
		if (!validateGender(teacher.gender)) {
			alert("Wrong gender text");
			return;
		}

		const token = sessionStorage.getItem("jwt");
		const bearer = 'Bearer ' + token;
		await fetch(`${apiLink}/admins/${adminId}/teachers/${teacherId}`, {
			method: 'put',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': bearer
			},
			body: JSON.stringify(teacher)
		})
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					alert("teacher updated successfully");
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
		if (name === "firstname" || name === "lastname" || name === "nationality") {
			if (!validateNameString(value)) {
				alert("Wrong values at text fields!");
				return;
			}
		}
		setTeacher({ ...teacher, [name]: value });
	}

	const deleteTeacher = async () => {
		const token = sessionStorage.getItem("jwt");
		const bearer = "Bearer " + token;
		await fetch(`${apiLink}/admins/${adminId}/teachers/${teacherId}`, {
			method: 'delete',
			headers: {
				'Authorization': bearer
			}
		})
			.then(res => res.json())
			.then(res => {
				res.status === "OK"
					? alert("Teacher deleted")
					: alert(res.message);
			})
	}

	return (
		<div>
			<div className="teacher">
				<h2>Update profile info</h2>
				<form className="teacher-form" onSubmit={onSubmit}>
					<label>
						Firstname:
					<input onChange={handleChange} name="firstname" value={teacher.firstname} />
					</label>
					<label>
						Lastname:
					<input onChange={handleChange} name="lastname" value={teacher.lastname} />
					</label>
					<label>
						Email:
					<input type="email" onChange={handleChange} name="email" value={teacher.email} />
					</label>
					<label>
						Password:
					<input type="text" onChange={handleChange} name="password" value={teacher.password} />
					</label>
					<label>
						Address:
					<input onChange={handleChange} name="address" value={teacher.address} />
					</label>
					<label>
						Phone number:
					<input onChange={handleChange} name="phone" value={teacher.phone} />
					</label>
					<label>
						Nationality:
					<input onChange={handleChange} name="nationality" value={teacher.nationality} />
					</label>
					<label>
						Age:
					<input type="number" min={18} max={100} onChange={handleChange} name="age" value={teacher.age} />
					</label>
					<label>
						Gender:
					<input onChange={handleChange} name="gender" value={teacher.gender} />
					</label>
					<button>Update</button>
				</form>
				<button className="danger" onClick={deleteTeacher}>Delete Teacher</button>
			</div>
		</div>
	);
}

/* Handles adding a teacher */
const AddTeacher = (props: { updateList: () => void, toggleForm: () => void }) => {
	const adminId = useContext(AdminContext);

	const [teacher, setTeacher] = useState<Teacher>({
		firstname: "",
		lastname: "",
		email: "",
		password: "",
		phone: "",
		address: "",
		nationality: "",
		age: 18,
		gender: "male"

	});

	const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		event.preventDefault();
		const name = event.target.name
		const value = event.target.value

		setTeacher({ ...teacher, [name]: value });
	}

	const onSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!validateGender(teacher.gender)) {
			alert("wrong gender value");
			return;
		}

		let nonEmptyValues = ["firstname", "lastname", "email", "password"];
		for (const [key, value] of Object.entries(teacher)) {
			if (value === "" && nonEmptyValues.includes(key)) {
				alert("You cannot have empty values!");
				return;
			}
		}

		const token = sessionStorage.getItem("jwt");
		const bearer = 'Bearer ' + token;
		await fetch(`${apiLink}/admins/${adminId}/teachers`, {
			method: 'post',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': bearer
			},
			body: JSON.stringify(teacher)
		})
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					alert("Teacher added!");
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
		<form onSubmit={onSubmit} className="hide" id="add-teacher-form">
			<h2>Add a teacher</h2>
			<label>
				Firstname:
                <input type='text' name="firstname" value={teacher.firstname} onChange={handleChange} />
			</label>
			<label>
				Lastname:
                <input type='text' name="lastname" value={teacher.lastname} onChange={handleChange} />
			</label>
			<label>
				Email:
                <input type='email' name="email" value={teacher.email} onChange={handleChange} />
			</label>
			<label>
				Password:
                <input type='text' name="password" value={teacher.password} onChange={handleChange} />
			</label>
			<label>
				Phone:
                <input type='text' name="phone" value={teacher.phone} onChange={handleChange} />
			</label>
			<label>
				Address:
                <input type='text' name="address" value={teacher.address} onChange={handleChange} />
			</label>
			<label>
				Nationality:
                <input type='text' name="nationality" value={teacher.nationality} onChange={handleChange} />
			</label>
			<label>
				Age:
                <input type='number' name="age" value={teacher.age} onChange={handleChange} min={18} max={100} step={1} />
			</label>
			<label>
				Gender:
				<select
					name="gender"
					value={teacher.gender}
					onChange={handleChange}>
					<option value={"male"}>Male</option>
					<option value={"female"}>Female</option>
				</select>
			</label>
			<button type="submit">Add teacher</button>
			<button onClick={cancel}>Cancel</button>
		</form>
	);
}

export default Teachers;
