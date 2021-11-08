import React, { useEffect, useState, useContext } from "react";
import apiLink from "../../API";
import { StudentContext } from '../Student';
import { CourseContext } from './Course';
import { convertDateString } from '../../Utils';

function Grades(props) {
  const course = useContext(CourseContext);
  const studentId = useContext(StudentContext);

  const [grades, setGrades] = useState([]);
  useEffect(() => {

    const getGrades = async () => {
      const token = sessionStorage.getItem("jwt");
      const bearer = 'Bearer ' + token;
      await fetch(`${apiLink}/students/${studentId}/courses/${course.id}/grades`, {
        headers: {
          'Authorization': bearer
        }
      })
        .then(res => res.json())
        .then(res => {
          if (res.status === "OK") {
            setGrades(res.result);
          } else {
						alert("Error", res.message, "error");
          }
        }).catch(_ => console.log(_));
    }

    getGrades();

  }, []);

  return <CourseItem grades={grades} />;
}

function CourseItem({ grades }) {
  return (
    <div className="student-grades">
      <table>
        <thead>
          <tr>
            <th>Grade</th>
            <th>Comment</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {grades.map(grade => <GradeRow key={grade.id} grade={grade} />)}
        </tbody>
      </table>
    </div>
  );
}

function GradeRow({ grade }) {
	let dateString = '';
	try {
		dateString = new Date(grade.date).toDateString();
	} catch (err) { 
		dateString = grade.date;
	}
  return (
    <tr>
      <td>{grade.grade}</td>
      <td>{grade.comment}</td>
      <td>{dateString}</td>
    </tr>
  );
}

export default Grades;
