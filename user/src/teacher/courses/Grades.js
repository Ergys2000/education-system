import { Link, useRouteMatch, useHistory } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import apiLink from "../../API";
import { TeacherContext } from "../Teacher";
import { CourseContext } from "./Course";
import { organizeGrades } from "../../Utils";

function StudentList(props) {
  const course = useContext(CourseContext);
  const teacherId = useContext(TeacherContext);
  const { url } = useRouteMatch();
  const [students, setStudents] = useState([]);
  useEffect(() => {

    const getCourseGrades = async () => {
      const token = sessionStorage.getItem("jwt");
      const bearer = 'Bearer ' + token;
      await fetch(`${apiLink}/teachers/${teacherId}/courses/${course.id}/grades`, {
        headers: {
          'Authorization': bearer
        }
      })
        .then(res => res.json())
        .then(res => {
          if (res.status === "OK") {
            const students = organizeGrades(res.result);
            const elements = students.map(student =>
              <Grades name={student.firstname + " " + student.lastname} grades={student.grades} key={student.id} />
            );
            setStudents(elements);
          } else {
            alert("Error", res.message, "error");
          }
        }).catch(_ => console.log(_));
    }

    getCourseGrades();

  }, []);

  return (
    <div className="student-list">
      <div className="action-buttons">
        <Link to={`${url}/add`}>Add Grades</Link>
        <Link to={`${url}/addsingle`}>Add Single Grade</Link>
        <Link to={`${url}/delete`}>Delete test grades</Link>
      </div>
      {students}
    </div>
  );
}

function Grades(props) {
  const [hidden, setHidden] = useState(true);

  return (
    <div className="grades">
      <div className="head" onClick={() => setHidden(!hidden)}>
        <h4>{props.name}</h4>
        <i className="material-icons">unfold_more</i>
      </div>
      <div className="body">
        <table className={hidden ? "hidden" : "shown"}>
          <thead>
            <tr>
              <th>Grade</th>
              <th>Comment</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {props.grades.map(grade => GradeRow(grade))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GradeRow(grade) {
  const history = useHistory();
  const { url } = useRouteMatch();
  const onClick = () => {
    history.push(`${url}/${grade.id}`, grade);
  }

	let dateString = '';
	try {
		dateString = new Date(grade.date).toDateString();
	} catch (err) { 
		dateString = grade.date;
	}

  return (
    <tr key={grade.id} onClick={onClick}>
      <td>{grade.grade}</td>
      <td>{grade.comment}</td>
      <td>{dateString}</td>
    </tr>
  );
}

export default StudentList;
