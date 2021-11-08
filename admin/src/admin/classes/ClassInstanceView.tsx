import React, { useState, useEffect, useContext } from 'react';
import { Route, Switch, useParams, useRouteMatch, useHistory, Link } from 'react-router-dom';
import { AdminContext } from "../Admin";
import apiLink from "../../API";

/* The interfaces that represent the shape of basic objects */
interface CourseInstance {
	id: number
	name: string
	category: string
}
interface Schedule {
	id: number
	name: string
}
interface Teacher {
	id: number
	firstname: string
	lastname: string
}

interface Student {
	id: number,
	firstname: string,
	lastname: string
}

interface Class {
	id: number
	name: string
}

const ClassInstanceView = () => {
	const { url, path } = useRouteMatch();
	return (
		<div className="class">
			<NavBar url={url} />
			<Switch>
				<Route exact path={`${path}/courses`}>
					<Courses />
				</Route>
				<Route exact path={`${path}/students`}>
					<Students />
				</Route>
				<Route exact path={`${path}/general`}>
					<General />
				</Route>
			</Switch>
		</div>
	);
}

/* The navigation bar of the class */
const NavBar = (props: { url: string }) => {
	const [focus, setFocus] = useState("general");
	return (
		<div className="class-nav">
			<Link to={`${props.url}/general`} className={focus === "general" ? "active" : ""} onClick={() => setFocus("general")}>
				<p>General</p>
			</Link>
			<Link to={`${props.url}/students`} className={focus === "students" ? "active" : ""} onClick={() => setFocus("students")}>
				<p>Students</p>
			</Link>
			<Link to={`${props.url}/courses`} className={focus === "courses" ? "active" : ""} onClick={() => setFocus("courses")}>
				<p>Courses</p>
			</Link>
		</div>
	);
}

/* Displays a list of students of this class */
const Students = () => {
	const adminId = useContext(AdminContext);
	const { classInstanceId } = useParams() as any;

	/* Getting the list of students */
	const [students, setStudents] = useState<Student[]>([]);
	useEffect(() => {
		const fetchStudents = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = 'Bearer ' + token;
			await fetch(`${apiLink}/admins/${adminId}/classInstances/${classInstanceId}/students`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setStudents(res.result);
					} else {
						alert(res.message);
					}
				}).catch(_ => alert("Something went wrong!"));
		}
		fetchStudents();
	}, [adminId]);

	return (
		<div className="student-list">
			<h2>Student list</h2>
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
							<td><Link to={`/${adminId}/students/${student.id}`}>VIEW</Link></td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

/* Handles modifying general info about this class */
const General = () => {
	const history = useHistory();
	const adminId = useContext(AdminContext);
	const { classInstanceId } = useParams() as any;
	const [classInstance, setClassInstance] = useState({
		name: "",
		classID: 0,
		teacherID: 0,
		scheduleID: 0,
		year: 2020
	});

	/* Theses states will hold the values for the form */
	const [teachers, setTeachers] = useState<Teacher[]>([]);
	const [schedules, setSchedules] = useState<Schedule[]>([]);
	const [classes, setClasses] = useState<Class[]>([]);

	/* In this useEffect we get all lists from the database for the above states */
	useEffect(() => {
		const fetchData = async () => {
			const bearer = "Bearer " + sessionStorage.getItem("jwt");

			/* Fetch the class instance info */
			await fetch(`${apiLink}/admins/${adminId}/classInstances/${classInstanceId}`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setClassInstance(res.result);
					} else {
						alert(res.message);
					}
				}).catch(err => alert(err.message));

			/* Fetch the types of classes */
			await fetch(`${apiLink}/admins/${adminId}/classes/`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setClasses(res.result);
					} else {
						alert(res.message);
					}
				}).catch(err => alert(err.message));

			/* Fetch the teachers */
			await fetch(`${apiLink}/admins/${adminId}/teachers`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setTeachers(res.result);
					} else {
						alert(res.message);
					}
				}).catch(err => alert(err.message));

			/* Fetch the schedules */
			await fetch(`${apiLink}/admins/${adminId}/schedules`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setSchedules(res.result);
					} else {
						alert(res.message);
					}
				}).catch(err => alert(err.message));
		}
		fetchData();
	}, [adminId, classInstanceId]);

	const onChange = (event: React.ChangeEvent) => {
		event.preventDefault();
		const name = (event.target as any).name;
		const value = (event.target as any).value;

		setClassInstance({ ...classInstance, [name]: value });
	}

	const onSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		const bearer = "Bearer " + sessionStorage.getItem("jwt");
		await fetch(`${apiLink}/admins/${adminId}/classInstances/${classInstanceId}`, {
			method: 'put',
			headers: {
				'Authorization': bearer,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(classInstance)
		})
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					alert("Class updated");
				} else {
					alert(res.message);
				}
			}).catch(err => console.log(err.message));
	}

	const deleteClassInstance = (event: React.MouseEvent) => {
		event.preventDefault();
		if (!window.confirm("Are you sure?")) {
			return;
		}
		if (!window.confirm("All the students and courses will be deleted, do you want to continue?")) {
			return;
		}

		const bearer = "Bearer " + sessionStorage.getItem("jwt");
		fetch(`${apiLink}/admins/${adminId}/classInstances/${classInstanceId}`, {
			headers: {
				"Authorization": bearer
			},
			method: "delete"
		})
			.then(res => res.json())
			.then(res => {
				console.log(res);
				if (res.status === "OK") {
					alert(res.message);
					history.push(`/${adminId}/classes`);
				} else {
					alert(res.message);
				}
			}).catch(_ => console.log(_));
	}

	return (
		<div className="general">
			<h2>Class settings</h2>
			<form onSubmit={onSubmit}>
				<label>
					Name:
                    <input name="name" value={classInstance.name} type="text" onChange={onChange} />
				</label>
				<label>
					Year:
                    <input name="year" value={classInstance.year} type="number" onChange={onChange} />
				</label>
				<label>
					Type of the class:
                    <select name="classID" value={classInstance.classID} onChange={onChange}>
						<option value={0}>Choose one</option>
						{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
					</select>
				</label>
				<label>
					The head teacher:
                    <select name="teacherID" value={classInstance.teacherID} onChange={onChange}>
						<option value={0}>Choose one</option>
						{teachers.map(t => <option key={t.id} value={t.id}>{t.firstname + "" + t.lastname}</option>)}
					</select>
				</label>
				<label>
					Schedule of the class:
                    <select name="scheduleID" value={classInstance.scheduleID} onChange={onChange}>
						<option value={0}>Choose one</option>
						{schedules.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
					</select>
				</label>
				<button>Update</button>
				<button onClick={deleteClassInstance} className="danger">Delete Class</button>
			</form>
		</div>
	);
}

/* Displays the view of a single class instance which contains it's courses
* and methods to manipulate them*/
const Courses = () => {
	const adminId = useContext(AdminContext);
	const { classInstanceId } = useParams() as any;

	/* Fetches the courses for this class instance */
	const [update, setUpdate] = useState(0);
	const [courses, setCourses] = useState<CourseInstance[]>([]);
	useEffect(() => {
		const token = sessionStorage.getItem("jwt");
		const bearer = 'Bearer ' + token;
		const fetchCourses = async () => {
			await fetch(`${apiLink}/admins/${adminId}/classInstances/${classInstanceId}/courses`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => res.status === "OK" ? res.result : [])
				.then(courseInstances => {
					setCourses(courseInstances);
				});
		};
		fetchCourses();
	}, [classInstanceId, adminId, update]);

	const [addCourse, setAddCourse] = useState(false);

	return (
		<div className="courses">
			<h2>Courses</h2>

			{addCourse 
				? <AddCourseInstance 
						classInstanceId={classInstanceId} 
						close={() => setAddCourse(false)}
						updateList={() => setUpdate(update + 1)} /> 
				: null }
			{!addCourse ? <button onClick={() => setAddCourse(true)}>Add a new course</button> : null}

			<table>
				<thead>
					<tr>
						<th>Id</th>
						<th>Name</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{courses.map(course =>
						<CourseInstanceItem
							key={course.id}
							course={course}
							updateList={() => setUpdate(update + 1)} />
					)}
				</tbody>
			</table>
		</div>
	);
}

/* Displays a single course in the course list */
const CourseInstanceItem = (
	{ course, updateList }: { course: CourseInstance, updateList: () => void }) => {

	const adminId = useContext(AdminContext);

	/* Handles making the request to delete this course
	 * TODO: Make the delete button show something on competion. */
	const deleteCourse = async () => {
		if (!window.confirm("Are you sure?")) {
			return;
		}
		if (!window.confirm("This course will be deleted permanently from the teacher and the students")) {
			return;
		}
		const bearer = "Bearer " + sessionStorage.getItem("jwt");
		await fetch(`${apiLink}/admins/${adminId}/courseInstances/${course.id}`, {
			method: "delete",
			headers: {
				'Authorization': bearer
			}
		})
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					alert("Course deleted");
					updateList();
				} else {
					alert(res.message);
				}
			});
	}
	return (
		<tr>
			<td>{course.id}</td>
			<td>{course.name}</td>
			<td><button onClick={deleteCourse}>Delete course</button></td>
		</tr>
	);
}

/* Handles adding a course */
const AddCourseInstance = (props: { close: () => void, classInstanceId: number, updateList: () => void }) => {
	interface Form {
		teacherID: number,
		courseID: number,
		classInstanceID: number
	}


	const adminId = useContext(AdminContext);

	/* Holds the form info */
	const [form, setForm] = useState<Form>({
		teacherID: 0,
		courseID: 0,
		classInstanceID: props.classInstanceId
	});

	/* Fetch the courses */
	const [courses, setCourses] = useState<CourseInstance[]>([]);
	const [teachers, setTeachers] = useState<Teacher[]>([]);
	useEffect(() => {
		const token = sessionStorage.getItem("jwt");
		const bearer = 'Bearer ' + token;
		/* we will use these to initialize the form fields */
		let teacherID = 0, courseID = 0;

		const fetchData = async () => {
			/* fetch the courses */
			await fetch(`${apiLink}/admins/${adminId}/courses`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setCourses(res.result);
						/* Also set the value of the form to the first course
						* because that is what it displays by default */
						if (res.result.length > 1) {
							courseID = res.result[0].id;
						}
					} else {
						alert(res.message);
					}
				}).catch(err => console.log(err));

			/* fetch the teachers */
			await fetch(`${apiLink}/admins/${adminId}/teachers`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setTeachers(res.result);
						/* Also set the value of the form to the first teacher
						* because that is what it displays by default */
						if (res.result.length > 1) {
							teacherID = res.result[0].id;
						}
					} else {
						alert(res.message);
					}
				}).catch(err => console.log(err));

			setForm({ ...form, teacherID: teacherID, courseID: courseID });
		}
		fetchData();
	}, [adminId]);

	/* handles the changes in the form*/
	const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		event.preventDefault();
		const name = event.target.name;
		const value = event.target.value;


		setForm({ ...form, [name]: value });
	}

	/* handles posting the course */
	const onSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		const token = sessionStorage.getItem("jwt");
		const bearer = 'Bearer ' + token;
		await fetch(`${apiLink}/admins/${adminId}/courseInstances`, {
			method: 'post',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': bearer
			},
			body: JSON.stringify(form)
		})
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					alert("The course successfully added!");
					props.updateList();
				} else {
					alert(res.message);
				}
			});
	}

	const closeForm = (event: React.FormEvent) => {
		event.preventDefault();
		props.close();
	}

	return (
		<form onSubmit={onSubmit}>
			<label>
				Course:
				<select name="courseID" value={form.courseID} onChange={handleChange}>
					<option value={0}>Choose one</option>
					{courses.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}
				</select>
			</label>
			<label>
				Teacher:
				<select name="teacherID" value={form.teacherID} onChange={handleChange}>
					<option value={0}>Choose one</option>
					{teachers.map(teacher => <option key={teacher.id} value={teacher.id}>{teacher.firstname + " " + teacher.lastname}</option>)}
				</select>
			</label>
			<button>Add course</button>
			<button onClick={closeForm}>Cancel</button>
		</form>
	);
}

export default ClassInstanceView;
