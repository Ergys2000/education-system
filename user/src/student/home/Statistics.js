import React, { useEffect, useState, useContext } from "react";
import apiLink from "../../API";
import { StudentContext } from "../Student";

/* This function takes as input a list of grades taken from the api
*  and returns an object which contains relevant statistics*/
function calculateGradeStatistics(grades) {
	let totalGrades = grades.length;
	let maxGrade = 4;
	let minGrade = 10;
	let maxCourse = "";
	let minCourse = "";

	grades.forEach(grade => {
		if (grade.grade < minGrade) {
			minGrade = grade.grade;
			minCourse = grade.name;
		}
		if (grade.grade > maxGrade) {
			maxGrade = grade.grade;
			maxCourse = grade.name;
		}
	});
	return { totalGrades, maxGrade, minGrade, maxCourse, minCourse };
}

/* This function takes as input a list of sessions taken from the api
*  and returns an object which contains relevant statistics*/
function calculateAttendance(sessions) {
	let attended = 0;
	let total = 0;

	sessions.forEach(session => {
		attended += session.attended;
		total += session.length;
	});

	let color = '#009c0d';
	if (attended / total < 0.5) {
		color = '#c9040b';
	} else if (attended / total < 0.8) {
		color = '#d1d113';
	}
	return { attended, total, color };
}

/* Displayes the list of the courses and the average grade */
export default function Statistics(_props) {
	const studentId = useContext(StudentContext);

	/* The state which holds the attendance information */
	const [attendance, setAttendance] = useState({
		attended: 0,
		total: 0,
		color: '#009c0d'
	});

	/* The state which holds the grades information */
	const [gradeStatistics, setGradeStatistics] = useState({
		totalGrades: 0,
		maxGrade: 10,
		maxCourse: "",
		minGrade: 4,
		minCourse: "",
	});

	useEffect(() => {
		const fetchInfo = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = "Bearer " + token;

			/* The request which retrieves a list of grades */
			await fetch(`${apiLink}/students/${studentId}/grades`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						const newstate = calculateGradeStatistics(res.result);
						setGradeStatistics(newstate);
					} else {
						alert("Error", res.message, "error");
					}
				}).catch(_ => console.log(_));

			/* The request which retrieves a list of attendance sesions */
			await fetch(`${apiLink}/students/${studentId}/attendance`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						const newAttendance = calculateAttendance(res.result);
						setAttendance(newAttendance);
					} else {
						alert("Error", res.message, "error");
					}
				}).catch(_ => console.log(_));
		}

		fetchInfo();
	}, [studentId]);


	return (
		<div className="statistics">
			<div className="statistics__head">
				<h3>Statistics</h3>
			</div>
			<div className="statistics__numbers">

				<div className="statistics__numbers__grades-count">
					<p><b>Total grades</b></p>
					<strong>{gradeStatistics.totalGrades}</strong>
				</div>

				<div className="statistics__numbers__max-grade">
					<p>Max grade</p>
					<strong>{gradeStatistics.maxGrade}</strong>
				</div>

				<div className="statistics__numbers__min-grade">
					<p>Min grade</p>
					<strong>{gradeStatistics.minGrade}</strong>
				</div>

				<div className="statistics__numbers__missings">
					<p><b>Attended / Total</b></p>
					<strong style={{ color: attendance.color }}>
						{attendance.attended} / {attendance.total}
					</strong>
				</div>

			</div>
			<div className="statistics__courses">

				<div className="statistics__courses__max">
					<p>Max. Grade</p>
					<strong>{gradeStatistics.maxCourse}</strong>
				</div>

				<div className="statistics__courses__min">
					<p>Min. Grade</p>
					<strong>{gradeStatistics.minCourse}</strong>
				</div>

			</div>
		</div>
	);
}
