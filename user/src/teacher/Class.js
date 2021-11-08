import { useState, useEffect, useContext } from 'react';
import { useParams, Link, Switch, useRouteMatch, Route } from 'react-router-dom';
import apiLink from "../API";
import { TeacherContext } from "./Teacher";
import { organizeGrades } from '../Utils';
import { getColorForCourse } from '../Utils';

function Class(_props) {
  const { path } = useRouteMatch();
  return (
    <div className="class">
      <header><h2>My Class</h2></header>
      <section>
        <Switch>
          <Route exact path={`${path}/`}>
            <CourseList />
          </Route>
          <Route exact path={`${path}/:courseId/grades`}>
            <StudentList />
          </Route>
        </Switch>
      </section>
    </div>
  );
}

function CourseList(_props) {
  const teacherId = useContext(TeacherContext);

  const [courses, setCourses] = useState([]);
  useEffect(() => {
    const fetchCourses = async () => {
      const token = sessionStorage.getItem("jwt");
      const bearer = 'Bearer ' + token;
      await fetch(`${apiLink}/teachers/${teacherId}/class`, {
        headers: {
          'Authorization': bearer
        }
      })
        .then(res => res.json())
        .then(res => {
          if (res.status === "OK") {
            setCourses(res.result);
          } else {
						alert("Error", res.message, "error");
          }
        }).catch(_ => console.log(_));
    }
    fetchCourses();
  }, [teacherId]);
  return (
    <div className="courses-list">
      <table>
        <thead>
          <tr>
						<th></th>
            <th>COURSE</th>
            <th>CATEGORY</th>
            <th>HOURS PER WEEK</th>
            <th>TEACHER</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {courses.map(x => <CourseListItem key={x.id} course={x} />)}
        </tbody>
      </table>
    </div>
  );
}

function CourseListItem({ course }) {
  let { url } = useRouteMatch();
	const teacherId = useContext(TeacherContext);

	const [hoursPerWeek, setHoursPerWeek] = useState(0);
	useEffect(() => {
		const fetchInfo = async () => {
			const bearer = "Bearer " + sessionStorage.getItem("jwt");
			await fetch(`${apiLink}/teachers/${teacherId}/courses/${course.id}/hours`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if(res.status === "OK") {
						setHoursPerWeek(res.result);
					} else {
            alert("Error!", res.message, "error");
					}
				}).catch(err => console.log(err));
		}

		fetchInfo();
	}, [teacherId]);
  return (
		<tr>
			<td className="color">
        <div style={{backgroundColor: getColorForCourse(course.id)}}></div>
      </td>
			<td className="name">{course.name}</td>
			<td className="category">{course.category}</td>
			<td className="hours">{hoursPerWeek}</td>
			<td className="teacher">{course.firstname + " " + course.lastname}</td>
			<td><Link to={`${url}/${course.id}/grades`}>View</Link></td>
		</tr>
  );
}

function StudentList(_props) {

  const teacherId = useContext(TeacherContext);

  const { courseId } = useParams();

  const [students, setStudents] = useState([]);
  useEffect(() => {
    const fetchCourseGrades = async () => {
      const token = sessionStorage.getItem("jwt");
      const bearer = 'Bearer ' + token;
      await fetch(`${apiLink}/teachers/${teacherId}/courses/${courseId}/grades`, {
        headers: {
          'Authorization': bearer
        }
      })
        .then(res => res.json())
        .then(res => {
          if (res.status === "OK") {
            const students = organizeGrades(res.result);
            const elements = students.map(student => (
              <Grades name={student.firstname} grades={student.grades} key={student.id} />
            ));
            setStudents(elements);
          } else {
						alert("Error", res.message, "error");
          }
        }).catch(_ => console.log(_));
    }

    fetchCourseGrades();

  }, [teacherId, courseId]);

  return (
    <div className="student-list">
      <h2>Student grades</h2>
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
  return (
    <tr key={grade.id}>
      <td>{grade.grade}</td>
      <td>{grade.comment}</td>
      <td>{grade.date}</td>
    </tr>
  );
}

export default Class;
