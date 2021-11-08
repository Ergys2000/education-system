import React, { useEffect, useState, useContext } from 'react';
import { Link, useRouteMatch, useParams, useHistory } from 'react-router-dom';
import apiLink from "../../API";
import { FileListItem } from "./FileList";
import { CourseContext } from "./Course";
import { StudentContext } from "../Student";
import { convertDateString } from '../../Utils';

/* Displays the list of assignments for this course */
function AssignmentList(props) {
	const studentId = useContext(StudentContext);
	const course = useContext(CourseContext);

	const [assignments, setAssignments] = useState([]);
	useEffect(() => {
		const fetchAssignments = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = "Bearer " + token;
			await fetch(`${apiLink}/students/${studentId}/courses/${course.id}/assignments`, {
				headers: { 'Authorization': bearer }
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setAssignments(res.result)
					} else {
						alert("Error", res.message, "error");
					}
				}).catch(_ => console.log(_));
		}
		fetchAssignments();
	}, []);

	return (
		<div className="assignment-list">
			{assignments.map(a => <AssignmentItem key={a.id} assignment={a} />)}
		</div>
	);
}

/* Displays one single assignment in the list */
function AssignmentItem({assignment}) {
	const { url } = useRouteMatch();

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
			<p style={dateStyle}>Due {convertDateString(assignment.due)}</p>
		</div>
	);
}

/* The component that displays the information about an assignment */
function Assignment(props) {
	const studentId = useContext(StudentContext);
	const course = useContext(CourseContext);
	const { assignmentId } = useParams();

	const [shouldUpdate, setShouldUpdate] = useState(0);

	/* The files that the student has uploaded so far */
	const [files, setFiles] = useState([]);
	useEffect(() => {
		const fetchFiles = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = "Bearer " + token;
			/* Retrieve them from the correct api endpoint */
			await fetch(`${apiLink}/students/${studentId}/courses/${course.id}/assignments/${assignmentId}/studentfiles`, {
				headers: { 'Authorization': bearer }
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setFiles(res.result);
					} else {
						alert("Error", res.message, "error");
					}
				}).catch(_ => console.log(_));
		}
		fetchFiles();
	}, [shouldUpdate]);

	/* Holds the information about the assignment, like title and description */
	const [assignment, setAssignment] = useState(null);
	useEffect(() => {
		const fetchAssignment = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = "Bearer " + token;
			await fetch(`${apiLink}/students/${studentId}/courses/${course.id}/assignments/${assignmentId}`, {
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
	}, [shouldUpdate]);

	/* Holds the list of files included in this assignment, like the test that
	 * you have to solve*/
	const [assignmentFiles, setAssignmentFiles] = useState([]);
	useEffect(() => {
		const fetchFiles = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = "Bearer " + token;
			await fetch(`${apiLink}/students/${studentId}/courses/${course.id}/assignments/${assignmentId}/files`, {
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

	const update = () => setShouldUpdate(shouldUpdate + 1);

	return (
		<div className="assignment">
			<h2>{assignment ? assignment.title : "title"}</h2>
			<p>{assignment ? assignment.description : "description"}</p>
			<div className="files">
				<div className="file-list">
					<h4>Assignment files</h4>
					<ul>
						{assignmentFiles.map(file => <FileListItem key={file.id} file={file} />)}
					</ul>
				</div>
				<div className="file-list">
					<h4>My files</h4>
					<FileForm
						classInstanceId={course.classInstanceID}
						studentId={studentId}
						courseId={course.id}
						updateCallback={update}
						assignmentId={assignmentId} />
					<ul>
						{files.map(file => <StudentFile key={file.id} file={file} updateList={update} />)}
					</ul>
				</div>
			</div>
		</div>
	);
}

/* Displays a single student file */
function StudentFile({ file, updateList }) {
	const courseId = file.courseInstanceID;
	const studentId = file.studentID;
	const filename = file.filename;
	const { assignmentId } = useParams();

	const downloadFile = (event) => {
		event.preventDefault();
		const downloadUrl =
			`${apiLink}/students/${studentId}/courses/${courseId}/assignments/${assignmentId}/studentfiles/${filename}`;
		window.open(downloadUrl, '_blank');
	}
	const deleteFile = (event) => {
		event.preventDefault();
		const bearer = "Bearer " + sessionStorage.getItem("jwt");
		fetch(`${apiLink}/students/${studentId}/courses/${courseId}/assignments/${assignmentId}/studentfiles/${file.id}`, {
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
	return (
		<li id={file.id}>
			<p>{filename.replace(/-\d{7,}/, "")}</p>
			<div className="actions">
				<i className="material-icons download" onClick={downloadFile}>download</i>
				<i className="material-icons delete" onClick={deleteFile}>delete</i>
			</div>
		</li>
	);
}

/* Handles uploading a file to the server */
function FileForm(props) {
	const studentId = props.studentId;
	const courseId = props.courseId;
	const assignmentId = props.assignmentId;

	const onSubmit = async (event) => {
		event.preventDefault();
		const bearer = "Bearer " + sessionStorage.getItem("jwt");

		const form = event.target;
		const formData = new FormData(form);
		await fetch(`${apiLink}/students/${studentId}/courses/${courseId}/assignments/${assignmentId}/studentfiles`, {
			method: 'post',
			headers: {
				'Authorization': bearer,
			},
			body: formData
		})
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					alert("Success!", res.message, "success");
					props.updateCallback();
				} else {
					alert("Error", res.message, "error");
				}
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
				<input type="submit" />

			</form>
		</div>
	)
}

export { AssignmentList, AssignmentItem, Assignment };
