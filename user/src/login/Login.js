import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import apiLink from "../API";

const Login = (_props) => {
	const history = useHistory();

	const [error, setError] = useState("");
	const [form, setForm] = useState({
		email: "",
		password: ""
	});

	const auth_student = async () => {
		const email = form.email;
		const password = form.password;
		const url = `${apiLink}/auth/auth_student?email=${email}&password=${password}`;
		await fetch(url)
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					if (res.result.authenticated) {
						const token = res.result.token;
						const id = res.result.id;
						sessionStorage.setItem("jwt", token);
						history.push(`/s/${id}`);
					} else {
						setError("Credentials are wrong!");
					}
				} else {
					alert("Error", res.message, "error");
				}
			}).catch(err => console.log(err));
	}

	const auth_teacher = async () => {
		const email = form.email;
		const password = form.password;
		const url = `${apiLink}/auth/auth_teacher?email=${email}&password=${password}`;
		await fetch(url)
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					if (res.result.authenticated) {
						const token = res.result.token;
						const id = res.result.id;
						sessionStorage.setItem("jwt", token);
						history.push(`/t/${id}`);
					} else {
						setError("Credentials are wrong!");
					}
				} else {
					alert("Error", res.message, "error");
				}
			}).catch(err => console.log(err));
	}

	const onChange = (e) => {
		e.preventDefault();
		const name = e.target.name;
		const value = e.target.value;

		setForm({ ...form, [name]: value });
	}

	return (
		<div className="login">
			<h2>Learning Management System</h2>
			<br></br>
			<p className="error">{error}</p>
			<input placeholder="Email..." type="text" name="email" value={form.email} onChange={onChange} />
			<br></br>
			<input placeholder="Password..." type="password" name="password" value={form.password} onChange={onChange} />
			<br></br>
			<div className="button-box">
				<button onClick={() => auth_student()}>Login as student</button>
				<br></br>
				<button onClick={() => auth_teacher()}>Login as teacher</button>
			</div>
		</div>
	);
}

export default Login;
