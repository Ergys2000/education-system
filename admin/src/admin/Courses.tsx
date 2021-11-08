import React, { useState, useEffect, useContext } from 'react';
import { Switch, Route, useRouteMatch, useParams, useHistory, Link } from 'react-router-dom';
import apiLink from '../API';
import { AdminContext } from './Admin';

interface Course {
    id?: number,
    name: string,
    category: string
}

/* The courses route */
const Courses = () => {
    const { path } = useRouteMatch();
    return (
        <Switch>
            <Route exact path={`${path}/`}>
                <CourseList />
            </Route>
            <Route exact path={`${path}/:courseId`}>
                <CourseView />
            </Route>
        </Switch>
    );
}

/* Displays the list of courses */
const CourseList = () => {
    /* Get the admin id, the history of the browser
     * and the current url.*/
    const adminId = useContext(AdminContext);
    const { url } = useRouteMatch();

    /* Used for updating the course list after a new course is added */
    const [update, setUpdate] = useState<number>(0);

    const [courses, setCourses] = useState<Course[]>([]);
    useEffect(() => {
        const fetchCourses = async () => {
            const token = sessionStorage.getItem("jwt");
            const bearer = 'Bearer ' + token;
            await fetch(`${apiLink}/admins/${adminId}/courses`, {
                headers: {
                    'Authorization': bearer
                }
            })
                .then(res => res.json())
                .then(res => {
                    if (res.status === "OK") {
                        setCourses(res.result);
                    } else {
                        alert("Something went wrong!");
                    }
                });
        }
        fetchCourses();
    }, [adminId, update]);

    /* Used to toggle the visibility of the form */
    const toggleForm = () => {
        const form = document.getElementById("add-course-form");
        const button = document.getElementById("add-course-button");
        form?.classList.toggle('hide');
        button?.classList.toggle('hide');
    }


    return (
        <div className="course-list">
            <br />
            <br />
            <button onClick={toggleForm} id="add-course-button">Add new course</button>
            <AddCourse updateList={() => setUpdate(update + 1)} toggleForm={toggleForm} />
            <table>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map(course => (
                        <tr key={course.id}>
                            <td>{course.id}</td>
                            <td>{course.name}</td>
                            <td>{course.category}</td>
                            <td><Link to={`${url}/${course.id}`}>Update/Delete</Link></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/* Displays the view to modify a single course */
const CourseView = () => {
    /* Get the admin id and the course id */
    const adminId = useContext(AdminContext);
    const { courseId } = useParams() as any;
    const history = useHistory();

    /* State used to update the course information from the api */
    const [course, setCourse] = useState<Course>({
        id: -1,
        name: "",
        category: ""
    });
    /* Get the information about the course  */
    useEffect(() => {
        const fetchCourse = async () => {
            const token = sessionStorage.getItem("jwt");
            const bearer = 'Bearer ' + token;
            await fetch(`${apiLink}/admins/${adminId}/courses/${courseId}`, {
                headers: {
                    'Authorization': bearer
                }
            })
                .then(res => res.json())
                .then(res => {
                    if (res.status === "OK") {
                        setCourse(res.result);
                    } else {
                        alert("Something went wrong, please refresh the page");
                    }
                }).catch(_ => alert("Something went wront!"));
        }
        fetchCourse();
    }, [adminId, courseId]);

    /* Handle the changes in the form */
    const handleChange = (event: React.ChangeEvent) => {
        event.preventDefault();
        const name = (event.target as any).name;
        const value = (event.target as any).value;

        setCourse({ ...course, [name]: value });
    }

    /* Submit the update of the course to the api */
    const onSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const token = sessionStorage.getItem("jwt");
        const bearer = 'Bearer ' + token;
        await fetch(`${apiLink}/admins/${adminId}/courses/${courseId}`, {
            method: 'put',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': bearer
            },
            body: JSON.stringify(course)
        })
            .then(res => res.json())
            .then(res => {
                if (res.status === "OK") {
                    alert("Course deleted successfully!");
                    history.goBack();
                } else {
                    alert(res.message);
                }
            });
    }

    /* Handles deleting a course */
    const deleteCourse = async (event: React.MouseEvent) => {
        event.preventDefault();
        const token = sessionStorage.getItem("jwt");
        const bearer = 'Bearer ' + token;
        await fetch(`${apiLink}/admins/${adminId}/courses`, {
            method: "delete",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': bearer
            },
            body: JSON.stringify({ courseID: courseId })
        })
            .then(res => res.json())
            .then(res => {
                if (res.status === "OK") {
                    alert("Course deleted successfully!");
                    history.goBack();
                } else {
                    alert(res.message);
                }
            });
    }

    return (
        <div className="course">
            <form onSubmit={onSubmit}>
                <label>
                    Name:
                <input type='text' name='name' value={course.name} onChange={handleChange} />
                </label>
                <label>
                    Category:
                <input type='text' name='category' value={course.category} onChange={handleChange} />
                </label>
                <button>Update</button>
            </form>
						<button onClick={() => history.goBack()}>Cancel</button>
            <button className="danger" onClick={deleteCourse}>Delete</button>
        </div>
    );
}

/* Handles adding a new course to the database */
const AddCourse = (props: { updateList: () => void, toggleForm: () => void}) => {
    const adminId = useContext(AdminContext);

    /* Hold the course information */
    const [course, setCourse] = useState<Course>({
        id: -1,
        name: "",
        category: ""
    });

    /* Handle the changes in the form */
    const handleChange = (event: React.ChangeEvent) => {
        event.preventDefault();
        const name = (event.target as any).name;
        const value = (event.target as any).value;

        setCourse({ ...course, [name]: value });
    }

    /* Handles submitting the form */
    const onSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        /* Validate */
        if (course.name === "" || course.category === "") {
            alert("Values cannot be empty.");
            return;
        }

        const token = sessionStorage.getItem("jwt");
        const bearer = "Bearer " + token;
        await fetch(`${apiLink}/admins/${adminId}/courses`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': bearer
            },
            body: JSON.stringify(course)
        })
            .then(res => res.json())
            .then(res => {
                if (res.status === "OK") {
                    alert("Course added successfully!");
                    props.updateList();
                    props.toggleForm();
                } else {
                    alert(res.message);
                }
            });
    }

    const cancel = (event: React.MouseEvent) => {
        event.preventDefault();
        props.toggleForm();
    }

    return (
        <form onSubmit={onSubmit} id="add-course-form" className="hide">
            <label>
                Name:
                <input type='text' name='name' value={course.name} onChange={handleChange} />
            </label>
            <label>
                Category:
                <input type='text' name='category' value={course.category} onChange={handleChange} />
            </label>
            <button>Add Course</button>
            <button onClick={cancel}>Cancel</button>
        </form>
    );
}

export default Courses;
