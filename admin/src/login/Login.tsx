import React, { useState, ChangeEvent } from 'react';
import { useHistory } from 'react-router-dom';
import apiLink from '../API';

interface LoginState {
	email: string,
	password: string
}

const Login: React.FC = () => {
	const history = useHistory();

	const [form, setForm] = useState<LoginState>({
		email: "",
		password: ""
	});

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();

		const value = (event.target as HTMLInputElement).value;
		const name = (event.target as HTMLInputElement).name;

		setForm({ ...form, [name]: value });
	}

	const onSubmit = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();

		const url = `${apiLink}/auth/auth_admin?email=${form.email}&password=${form.password}`;

		await fetch(url)
			.then(res => res.json())
			.then(response => {
				if (response.status === "OK") {
					const res = response.result;
					if (res.authenticated) {
						const id = res.id;
						sessionStorage.setItem("jwt", res.token);
						history.push(`/${id}`);
					} else {
						alert("Username or password is wrong");
					}
				} else {
					alert(response.message);
				}
			}).catch(err => console.log(JSON.stringify(err)));

	}

	return (
		<div className="Login">
			<div className="left-pane">
				<h2>Login</h2>
			</div>
			<div className="right-pane">
				<h2>Learning Management System</h2>
				<input id="emailField" placeholder="Email..." type="text" name="email" onChange={handleChange} value={form.email} />
				<br></br>
				<input id="passwordField" placeholder="Password..." type="password" name="password" onChange={handleChange} value={form.password} />
				<br></br>
				<div className="button-box">
					<button onClick={onSubmit}>Login</button>
				</div>
			</div>
		</div>
	);
}
export default Login;
