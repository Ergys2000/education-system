import React, { useEffect, useState, useContext } from 'react';
import apiLink from "../../API";
import { StudentContext } from "../Student";
import { CourseContext } from "./Course";

function FileList(props) {
	const course = useContext(CourseContext);
	const studentId = useContext(StudentContext);

	const [files, setFiles] = useState([]);
	useEffect(() => {
		const fetchFiles = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = 'Bearer ' + token;
			await fetch(`${apiLink}/students/${studentId}/courses/${course.id}/files`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if(res.status === "OK") {
						setFiles(res.result);
					} else {
						alert("Error", res.message, "error");
					}
				}).catch(_ => console.log(_));
		}
		fetchFiles();
	}, [])


	return (
		<div className="file-list">
			<h2>General course files</h2>
			<ul>
				{files.map(file => <FileListItem key={file.id} file={file} />)}
			</ul>
		</div>
	);
}

function FileListItem({ file }) {
  const studentId = useContext(StudentContext);
	const courseId = file.courseInstanceID;
  const stripedFilename = file.filename.replace(/-\d{7,}/, "");;

  const downloadUrl = 
    `${apiLink}/students/${studentId}/courses/${courseId}/files/${file.filename}`;

	const downloadFile = (event) => {
		event.preventDefault();
		window.open(downloadUrl, '_blank');
	}
	return (
    <li id={file.id}>
      <p>{stripedFilename}</p>
			<div className="actions">
				<i className="material-icons" onClick={downloadFile}>download</i>
			</div>
    </li>
	);
}

export { FileList, FileListItem };
