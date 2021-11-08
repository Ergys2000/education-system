import React, { useState, useEffect, useContext } from 'react';
import { Link, useRouteMatch, useParams } from 'react-router-dom';
import apiLink from "../../API";
import { CourseContext } from "./Course";
import { TeacherContext } from "../Teacher";
import { organizeStudents, convertDateString } from '../../Utils';

/* Displays the list of assignments for this course */
function AssignmentList(props) {
	const teacherId = useContext(TeacherContext);
	const course = useContext(CourseContext);

	const [shouldUpdate, setShouldUpdate] = useState(0);

	const [assignments, setAssignments] = useState([]);
	useEffect(() => {
		const fetchAssignments = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = "Bearer " + token;
			await fetch(`${apiLink}/teachers/${teacherId}/courses/${course.id}/assignments`, {
				headers: { 'Authorization': bearer }
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setAssignments(res.result);
					} else {
						alert("Error", res.message, "error");
					}
				}).catch(_ => console.log(_));
		}
		fetchAssignments();
	}, [teacherId, course.id, shouldUpdate]);

	const update = () => setShouldUpdate(shouldUpdate + 1);

	return (
		<div className="assignment-list">
			<AssignmentForm updateCallback={update} />
			{assignments.map(a => <AssignmentItem key={a.id} assignment={a} updateList={update} />)}
		</div>
	);
}

/* Displays one single assignment in the list */
function AssignmentItem({ assignment, updateList }) {
	const teacherId = useContext(TeacherContext);
	const { url } = useRouteMatch();
	const [modify, setModify] = useState(false);

	const onDeleteClicked = () => {
		const bearer = "Bearer " + sessionStorage.getItem("jwt");
		fetch(`${apiLink}/teachers/${teacherId}/courses/${assignment.courseInstanceID}/assignments/${assignment.id}`, {
			method: 'delete',
			headers: {
				'Authorization': bearer
			}
		}).then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					updateList();
					alert("Success!", res.message, "success");
				} else {
					alert("Error", res.message, "error");
				}
			}).catch(err => console.log(err));
	}

	let dateStyle = {
	};
	/* The assignment date-time */
	let assignmentDateObject = new Date(assignment.due);
	/* The current date-time */
	let nowDateObject = new Date();
	/* Compare them and set the text color */
	if (assignmentDateObject.valueOf() < nowDateObject.valueOf()) {
		dateStyle.color = "#c43d33";
	}


	return (
			<div className="assignment">
				<div className="title">
					<i className="material-icons">folder</i>
					<Link to={`${url}/${assignment.id}`}>{assignment.title}</Link>
				</div>
				<div className="actions">
					<p style={dateStyle}>Due {convertDateString(assignment.due)}</p>
					<i className="material-icons actions__edit" onClick={() => setModify(true)}>edit</i>
					<i className="material-icons actions__delete" onClick={onDeleteClicked}>delete</i>
				</div>
				{modify ? (<ModifyAssignment updateList={updateList} assignment={assignment} close={() => setModify(false)} />) : null}

			</div>
		);
}

/* Displays a popup to modify the assignment */
function ModifyAssignment({ assignment, close, updateList }) {
	const teacherId = useContext(TeacherContext);
	const [form, setForm] = useState({
		title: assignment.title,
		description: assignment.description,
		due: assignment.due
	});
	const handleChange = (event) => {
		event.preventDefault();

		const name = event.target.name;
		const value = event.target.value;

		if (name === 'title' && value.length > 100) {
			alert("Error", "Title is too long!", "error");
			return;
		}

		setForm({ ...form, [name]: value });
	};
	const onSubmit = (event) => {
		event.preventDefault();
		const token = sessionStorage.getItem("jwt");
		const bearer = "Bearer " + token;
		fetch(`${apiLink}/teachers/${teacherId}/courses/${assignment.courseInstanceID}/assignments/${assignment.id}`, {
			method: 'put',
			headers: {
				'Authorization': bearer,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(form)
		})
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					alert("Success!", res.message, "success");
					updateList();
				} else {
					alert("Error", res.message, "error");
				}
				close();
			})
			.catch(err => console.log(err));
	};
	const cancel = (event) => {
		event.preventDefault();
		close();
	};
	return (
		<div className="assignment__modify">
			<form onSubmit={onSubmit}>
				<label>
					Title
					<br />
					<input name="title" value={form.title} onChange={handleChange} type="text" />
				</label>
				<label>
					Description
					<br />
					<input name="description" value={form.description} onChange={handleChange} type="text" />
				</label>
				<label>
					Due
					<br />
					<input name="due" value={form.due} onChange={handleChange} type="datetime-local" />
				</label>
				<button>Modify assignment</button>
				<button onClick={cancel}>Cancel</button>
			</form>
		</div>
	);
}

/* Handles creating a new assignment */
function AssignmentForm(props) {
	const teacherId = useContext(TeacherContext);
	const course = useContext(CourseContext);

	const [form, setForm] = useState({
		title: "",
		description: "",
		due: ""
	});

	const [shown, setShown] = useState(false);

	const handleChange = (event) => {
		event.preventDefault();

		const name = event.target.name;
		const value = event.target.value;

		if (name === 'title' && value.length > 100) {
			alert("Error", "Title is too long!", "error");
			return;
		}

		setForm({ ...form, [name]: value });
	}

	const onSubmit = async (event) => {
		event.preventDefault();
		const token = sessionStorage.getItem("jwt");
		const bearer = "Bearer " + token;
		await fetch(`${apiLink}/teachers/${teacherId}/courses/${course.id}/assignments`, {
			method: 'post',
			headers: {
				'Authorization': bearer,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(form)
		})
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					alert("Success", "Assignment added successfully!", "success");
					/* This function updates the assignment list */
					props.updateCallback();
				} else {
					alert("Error", "Could not add assignment!", "error");
				}
			})
			.catch(err => console.log(err));
	}

	const hide = (event) => {
		event.preventDefault();
		setShown(false);
	}

	return (
		<div className="assignment-form">
			<button className={shown ? "hidden" : "shown"} onClick={() => setShown(true)}>Add assignment</button>
			<form onSubmit={onSubmit} className={shown ? "shown" : "hidden"}>
				<label>
					Title
					<br />
					<input name="title" value={form.title} onChange={handleChange} type="text" />
				</label>
				<label>
					Description
					<br />
					<input name="description" value={form.description} onChange={handleChange} type="text" />
				</label>
				<label>
					Due
					<br />
					<input name="due" value={form.due} onChange={handleChange} type="datetime-local" />
				</label>
				<button>Add assignment</button>
				<button onClick={hide}>Cancel</button>
			</form>
		</div>
	);
}

/* The component that displays the information about an assignment */
function Assignment(props) {
	const teacherId = useContext(TeacherContext);
	const course = useContext(CourseContext);
	const { assignmentId } = useParams();

	/* Used to update the assignment page after a file upload */
	const [shouldUpdate, setShouldUpdate] = useState(0);

	/* Used to get infomation about the assignment */
	const [assignment, setAssignment] = useState(null);
	useEffect(() => {
		const fetchAssignment = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = "Bearer " + token;
			await fetch(`${apiLink}/teachers/${teacherId}/courses/${course.id}/assignments/${assignmentId}`, {
				headers: { 'Authorization': bearer }
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setAssignment(res.result);
					} else {
						alert("Error", res.message, "error");
					}
				}).catch(_ => console.log(_));
		}
		fetchAssignment();
	}, [shouldUpdate, teacherId, course.id, assignmentId]);

	/* used to get the assignment files */
	const [assignmentFiles, setAssignmentFiles] = useState([]);
	useEffect(() => {
		const fetchFiles = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = "Bearer " + token;
			await fetch(`${apiLink}/teachers/${teacherId}/courses/${course.id}/assignments/${assignmentId}/files`, {
				headers: { "Authorization": bearer }
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setAssignmentFiles(res.result);
					} else {
						alert("Error", res.message, "error");
					}
				}).catch(_ => console.log(_));
		}
		fetchFiles();
	}, [shouldUpdate]);

	/* This function makes the assignment page update */
	const update = () => setShouldUpdate(shouldUpdate + 1);

	return (
		<div className="assignment">
			<h2>{assignment ? assignment.title : "title"}</h2>
			<p>{assignment ? assignment.description : "description"}</p>
			<div className="files">
				<div className="file-list">
					<h4>Assignment files</h4>
					<FileForm
						updateCallback={update}
						courseInstanceId={course.id}
						assignmentId={assignmentId}
						classInstanceId={course.classInstanceID} />
					<ul>
						{assignmentFiles.map(file => <AssignmentFileItem key={file.id} updateList={update} file={file} />)}
					</ul>
				</div>
				<div className="student-files">
					<h4>Student files</h4>
					<StudentList courseId={course.id} teacherId={teacherId} assignmentId={assignmentId} />
				</div>
			</div>
		</div>
	);
}

/* Displays a single assignment file */
const AssignmentFileItem = ({ file, updateList }) => {
	const stripedFilename = file.filename.replace(/-\d{7,}/, "");;
	const courseId = file.courseInstanceID;
	const teacherId = useContext(TeacherContext);

	const deleteFile = (event) => {
		event.preventDefault();
		const bearer = "Bearer " + sessionStorage.getItem("jwt");
		fetch(`${apiLink}/teachers/${teacherId}/courses/${courseId}/files/${file.id}`, {
			method: 'delete',
			headers: {
				'Authorization': bearer
			}
		})
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					alert("Success!", res.message, "success");
				} else {
					alert("Error", res.message, "error");
				}
				updateList();
			}).catch(err => console.log(err));
	}
	const downloadFile = (event) => {
		event.preventDefault();
		window.open(
			`${apiLink}/teachers/${teacherId}/courses/${courseId}/files/${file.filename}`,
			'_blank');
	}
	return (
		<li id={file.id}>
			<p>{stripedFilename}</p>
			<div className="actions">
				<i className="material-icons download" onClick={downloadFile}>download</i>
				<i className="material-icons delete" onClick={deleteFile}>delete</i>
			</div>
		</li>
	);
}

/* Displays the list of students that have uploaded a file */
function StudentList(props) {
	const courseId = props.courseId;
	const teacherId = props.teacherId;
	const assignmentId = props.assignmentId;

	const [students, setStudents] = useState([]);
	useEffect(() => {
		const fetchStudents = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = "Bearer " + token;
			await fetch(`${apiLink}/teachers/${teacherId}/courses/${courseId}/assignments/${assignmentId}/studentfiles`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setStudents(organizeStudents(res.result));
					} else {
						alert("Error", res.message, "error");
					}
				}).catch(_ => console.log(_));
		}
		fetchStudents();
	}, [teacherId, courseId, assignmentId]);

	return (
		<div className="student-files">
			{students.map(student => <Student key={student.id} student={student} />)}
		</div>
	);
}

/* Displays a single student and his files */
function Student({ student }) {
	const firstname = student.firstname;
	const lastname = student.lastname;
	const files = student.files;

	const [filesShown, setFilesShown] = useState(false);
	return (
		<div className="student">
			<div className="head" onClick={() => setFilesShown(!filesShown)}>
				<h4>{firstname + " " + lastname}</h4>
				<i className="material-icons">unfold_more</i>
			</div>
			<div className="body">
				<div className={"file-list " + (filesShown ? "shown" : "hidden")}>
					<ul>
						{files.map(file => <StudentFileItem key={file.id} file={file} />)}
					</ul>
				</div>
			</div>
		</div>
	);
}

/* Displays a single file in the list */
function StudentFileItem({ file }) {
	const teacherId = useContext(TeacherContext);
	const stripedFilename = file.filename.replace(/-\d{7,}/, "");;
	const assignmentId = file.assignmentID;
	const studentId = file.studentID;

	const courseId = file.courseInstanceID;

	const downloadFile = (event) => {
		event.preventDefault();
		window.open(
			`${apiLink}/teachers/${teacherId}/courses/${courseId}/assignments/${assignmentId}/studentfiles/${studentId}/${file.filename}`,
			'_blank');
	}
	return (
		<li id={file.id}>
			<p className="filename">{stripedFilename}</p>
			<p className="datetime">{convertDateString(file.posted_on)}</p>
			<i className="material-icons" onClick={downloadFile}>download</i>
		</li>
	);
}

/* Handles uploading a file */
function FileForm(props) {
	const teacherId = useContext(TeacherContext);

	const assignmentId = props.assignmentId;
	const courseId = props.courseInstanceId;

	const onSubmit = async (event) => {
		event.preventDefault();
		const bearer = "Bearer " + sessionStorage.getItem("jwt");
		const form = event.target;
		const formData = new FormData(form);
		await fetch(`${apiLink}/teachers/${teacherId}/courses/${courseId}/assignments/${assignmentId}/files`, {
			method: 'post',
			body: formData,
			headers: {
				'Authorization': bearer,
			}
		})
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					alert("Success!", res.message, "success");
				} else {
					alert("Error", res.message, "error");
				}
				props.updateCallback();
			})
			.catch(err => console.log(err));
	}

	const [filename, setFilename] = useState(null);
	const onFileChange = (e) => {
		const value = e.target.value;
		const newFilename = value.split("\\").pop();
		setFilename(newFilename);
	}


	return (
		<div className="file-form">
			<form
				onSubmit={onSubmit}
				method="post"
				encType="multipart/form-data">

				<input name="assignmentID" value={assignmentId} hidden={true} type="text" readOnly={true} />
				<label className="file">
					<i className="material-icons">upload</i>
					{filename || "Choose"}
					<input onChange={onFileChange} name="file" type="file" />
				</label>
				<input type="submit" value="Upload" />
			</form>
		</div>
	);
}

export { AssignmentList, Assignment };
