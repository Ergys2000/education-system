import React, { useEffect, useState, useContext } from 'react';
import apiLink from "../../API";
import { TeacherContext } from "../Teacher";
import { CourseContext } from "./Course";

/* Displays a list of general course files */
function FileList(props) {
	const teacherId = useContext(TeacherContext);
	const course = useContext(CourseContext);

	const [shouldUpdate, setShouldUpdate] = useState(0);

	const [files, setFiles] = useState([]);
	useEffect(() => {
		const fetchFiles = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = 'Bearer ' + token;

			fetch(`${apiLink}/teachers/${teacherId}/courses/${course.id}/files`, {
				headers: {
					'Authorization': bearer
				}
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
	}, [teacherId, course.id, shouldUpdate])

	const update = () => setShouldUpdate(shouldUpdate + 1);

	return (
		<div className="file-list">
			<FileForm
				updateList={update}
				classInstanceId={course.classInstanceID}
				courseId={course.id} />
			<ul>
				{files.map(file => <FileListItem key={file.id} updateList={update} file={file} />)}
			</ul>
		</div>
	);
}

/* Renders a single file */
function FileListItem({ file, updateList }) {
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

/* Handles uploading a file to the api */
function FileForm(props) {
	const teacherId = useContext(TeacherContext);
	const courseId = props.courseId;

	const onSubmit = async (event) => {
		event.preventDefault();
		const bearer = "Bearer " + sessionStorage.getItem("jwt");
		const form = event.target;
		const formData = new FormData(form);
		await fetch(`${apiLink}/teachers/${teacherId}/courses/${courseId}/files`, {
			method: 'post',
			body: formData,
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
				props.updateList();
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
			<h3>Upload a new file</h3>
			<form
				onSubmit={onSubmit}
				method="post"
				encType="multipart/form-data">

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

export default FileList;
