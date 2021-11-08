import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import apiLink from '../../API';
import { TeacherContext } from '../Teacher';
import { CourseContext } from './Course';

interface Grade {
  id: number
  grade: number
  comment: string
  date: string
}

/* Handles modifying an existing grade */
const ModifyGrade = () => {
  /* Get the teacher and course data to perform the api requests */
  const teacherId = useContext(TeacherContext);
  const course = useContext(CourseContext) as any;

  /* Get the history object to retrieve the passed state */
  const history = useHistory();

  /* Create the grade state */
  const [grade, setGrade] = useState<Grade>({
    id: 0,
    grade: 0,
    comment: "",
    date: ""
  });
  /* Update the grade state in a useEffect with the passed state, do it only once */
  useEffect(() => {
    setGrade(history.location.state as Grade);
  }, []);

  /* Handles the changes in the input fields */
  const onChange = (event: React.ChangeEvent) => {
    event.preventDefault();
    const name = (event.target as any).name;
    const value = (event.target as any).value;

    setGrade({ ...grade, [name]: value });
  }

  /* Handles submitting the new grade to the api */
  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    /* Get the bearer token */
    const bearer = "Bearer " + sessionStorage.getItem("jwt");
    /* Perform the api request with the correct options */
    fetch(`${apiLink}/teachers/${teacherId}/courses/${course.id}/grades/${grade.id}`, {
      method: 'put',
      headers: {
        'Authorization': bearer,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(grade)
    })
      .then(res => res.json())
      .then(res => {
        if(res.status === "OK") {
          (alert as any)("Success!", res.message, "success");
        } else {
          (alert as any)("Error!", res.message, "error");
        }
        history.goBack();
      }).catch(err => console.log(err));
  }

  /* Handles deleting a grade */
  const deleteGrade = (event: React.FormEvent) => {
    event.preventDefault();
    /* Get the bearer token */
    const bearer = "Bearer " + sessionStorage.getItem("jwt");
    /* Perform the api request with the correct options */
    fetch(`${apiLink}/teachers/${teacherId}/courses/${course.id}/grades/${grade.id}`, {
      method: 'delete',
      headers: {
        'Authorization': bearer,
      }
    })
      .then(res => res.json())
      .then(res => {
        if(res.status === "OK") {
          (alert as any)("Success!", res.message, "success");
        } else {
          (alert as any)("Error", res.message, "error");
        }
        history.goBack();
      }).catch(err => console.log(err));
  }

  return (
    <div className="update-grade">
      <form onSubmit={onSubmit}>
        <label>
          Grade:
          <input name="grade" type="number" value={grade.grade} min="4" max="10" onChange={onChange} />
        </label>
        <label>
          Comment:
          <input name="comment" type="text" value={grade.comment} onChange={onChange} />
        </label>
        <label>
          Date:
          <input name="date" type="date" value={grade.date} onChange={onChange} />
        </label>
        <button>Update</button>
        <button className="delete" onClick={deleteGrade}>Delete</button>
      </form>
    </div>
  );
}

/* Handles deleting the grades of a test */
const DeleteGrade = () => {
  /* Get the teacher and course context to perform the requests */
  const teacherId = useContext(TeacherContext);
  const course = useContext(CourseContext) as any;

  /* Get the history object, it is used to perform redirection */
  const history = useHistory();

  const [date, setDate] = useState<string>("");
  const onChange = (event: React.ChangeEvent) => {
    event.preventDefault();

    setDate((event.target as any).value);
  }

  /* Perform the api request with the correct options */
  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const bearer = "Bearer " + sessionStorage.getItem("jwt");
    fetch(`${apiLink}/teachers/${teacherId}/courses/${course.id}/grades`, {
      method: 'delete',
      headers: {
        'Authorization': bearer,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ date: date, classInstanceID: course.classInstanceID })
    })
      .then(res => res.json())
      .then(res => {
        (alert as any)("Error", res.message, "error");
        history.goBack();
      }).catch(err => console.log(err));
  }

  return (
    <div className="update-grade">
      <h3>Choose the date of the exam :</h3>
      <form onSubmit={onSubmit}>
        <label>
          Date:
          <input name="date" type="date" value={date} onChange={onChange} />
        </label>
        <button>Delete</button>
      </form>
    </div>
  );
}

export { ModifyGrade, DeleteGrade };
