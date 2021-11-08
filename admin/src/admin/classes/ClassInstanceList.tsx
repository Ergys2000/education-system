import React, { useState, useEffect, useContext } from 'react';
import { Link, useRouteMatch, useParams, useHistory } from 'react-router-dom';
import { AdminContext } from "../Admin";
import apiLink from "../../API";
import AddClassInstance from './AddClassInstance';

/* The interfaces that represent the shape of basic objects */
interface ClassInstance {
    id: number
    year: number
    classID: number
    teacherID: number
    scheduleID: number
    name: string
}

interface CourseInstance {
    id: number
    name: string
    category: string
}

interface Teacher {
    id: number
    firstname: string
    lastname: string
}



/* Displays the list of class instances of a particular class */
const ClassInstanceList = () => {
    const adminId = useContext(AdminContext);
    const { classId } = useParams() as any;
    const history = useHistory();

    /* Fetch the class instances for this particular class */
    const [update, setUpdate] = useState(0);
    const [classInstances, setClassInstances] = useState<ClassInstance[]>([]);
    useEffect(() => {
        const fetchClassInstances = async () => {
            const token = sessionStorage.getItem("jwt");
            const bearer = 'Bearer ' + token;
            await fetch(`${apiLink}/admins/${adminId}/classes/${classId}/instances`, {
                headers: {
                    'Authorization': bearer
                }
            })
                .then(res => res.json())
                .then(res => res.status === "OK" ? res.result : [])
                .then(classInstances => {
                    setClassInstances(classInstances);
                })
                .catch(err => console.log(err));
        }
        fetchClassInstances();
    }, [adminId, classId, update]);

    const toggleForm = () => {
        const form = document.getElementById("add-class-form");
        const button = document.getElementById("add-class-button");
        form?.classList.toggle('hide');
        button?.classList.toggle('hide');
    }


    const deleteClass = (event: React.MouseEvent) => {
      event.preventDefault();
      if(!window.confirm("Are you sure you want to delete this class category?")) {
        return;
      }
      const bearer = "Bearer " + sessionStorage.getItem("jwt");
      fetch(`${apiLink}/admins/${adminId}/classes/${classId}`, {
        method: 'delete',
        headers: {
          'Authorization': bearer
        }
      })
        .then(res => res.json())
        .then(res => {
            alert(res.message);
            history.push(`/${adminId}/classes`);
        })
        .catch(err => console.log(err));
    }

    return (
        <div className="class-instance-list">
            <br />
            <br />
            <button id="add-class-button" onClick={toggleForm}>Add new class instance</button>
            <button className="delete" onClick={deleteClass}>Delete this class</button>
            <AddClassInstance updateList={() => setUpdate(update + 1)} toggleForm={toggleForm} />
            <table>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Year</th>
                        <th>Name</th>
                        <th>Schedule Id</th>
                        <th>Teacher Id</th>
                        <th>Class Id</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {classInstances.map(ci => <ClassInstanceListItem key={ci.id} ci={ci} />)}
                </tbody>
            </table>
        </div>
    );
}

/* Displays a single item in the class instance list */
const ClassInstanceListItem = ({ ci }: { ci: ClassInstance }) => {
    const { url } = useRouteMatch() as any;
    return (
        <tr>
            <td>{ci.id}</td>
            <td>{ci.year}</td>
            <td>{ci.name}</td>
            <td>{ci.scheduleID}</td>
            <td>{ci.teacherID}</td>
            <td>{ci.classID}</td>
            <td><Link to={`${url}/${ci.id}/general`}>VIEW</Link></td>
        </tr>
    );
}

/* Displays the view of a single class instance which contains it's courses
* and methods to manipulate them*/
const ClassInstanceView = () => {
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

    return (
        <div className="class">
            <h2>Courses</h2>
            <AddCourseInstance classInstanceId={classInstanceId} updateList={() => setUpdate(update + 1)} />
            <table>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Name</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map(course => <CourseInstanceItem key={course.id} course={course} />)}
                </tbody>
            </table>
        </div>
    );
}

/* Displays a single course in the course list */
const CourseInstanceItem = ({ course }: { course: CourseInstance }) => {
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
        await fetch(`${apiLink}/admins/${adminId}/courseInstances`, {
            method: "delete",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': bearer
            },
            body: JSON.stringify({ courseInstanceID: course.id })
        })
            .then(res => res.json())
            .then(res => {
                if (res.status === "OK") {
                    alert("Course deleted");
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
const AddCourseInstance = (props: { classInstanceId: number, updateList: () => void }) => {
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

    return (
        <form onSubmit={onSubmit}>
            <label>
                Course:
                <select name="courseID" value={form.courseID} onChange={handleChange}>
                    {courses.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}
                </select>
            </label>
            <label>
                Teacher:
                <select name="teacherID" value={form.teacherID} onChange={handleChange}>
                    {teachers.map(teacher => <option key={teacher.id} value={teacher.id}>{teacher.firstname + " " + teacher.lastname}</option>)}
                </select>
            </label>
            <button>Add course</button>
        </form>
    );
}

export default ClassInstanceList;
