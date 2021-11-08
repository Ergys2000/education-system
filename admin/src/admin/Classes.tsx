import React, { useState, useEffect, useContext } from 'react';
import { Link, Switch, useRouteMatch, Route } from 'react-router-dom';
import { AdminContext } from "../admin/Admin";
import apiLink from "../API";
import ClassInstanceList from './classes/ClassInstanceList';
import ClassInstanceView from './classes/ClassInstanceView';

/* The interfaces that represent the shape of basic objects */
interface Class {
    id: number
    name: string
}

/* Defines the url routes for the class */
const ClassesRoute = () => {
    const { path } = useRouteMatch();
    return (
        <div className="option">
            <Switch>
                <Route exact path={`${path}/`}>
                    <ClassList />
                </Route>

                <Route exact path={`${path}/:classId`}>
                    <ClassInstanceList />
                </Route>

                <Route path={`${path}/:classId/:classInstanceId`}>
                    <ClassInstanceView />
                </Route>
            </Switch>
        </div>
    );
}

/* Displays a list of general classes */
const ClassList = () => {
    const adminId = useContext(AdminContext);

    /* Used to make the useEffect of this component update */
    const [update, setUpdate] = useState(0);
    /* Fetch the list of classes from the API */
    const [classes, setClasses] = useState<Class[]>([]);
    useEffect(() => {
        const fetchClasses = async () => {
            const token = sessionStorage.getItem("jwt");
            const bearer = 'Bearer ' + token;
            await fetch(`${apiLink}/admins/${adminId}/classes`, {
                headers: {
                    'Authorization': bearer
                }
            })
                .then(res => res.json())
                .then(res => {
                    if (res.status === "OK") {
                        setClasses(res.result);
                    } else {
                        alert(res.message);
                    }
                }).catch(_ => alert("Could not connect to server"));
        }
        fetchClasses();
    }, [adminId, update]);

    /* Used to toggle the visibility of the form */
    const toggleForm = () => {
        const form = document.getElementById("add-class-form");
        const button = document.getElementById("add-class-button");
        form?.classList.toggle('hide');
        button?.classList.toggle('hide');
    }

    return (
        <div className="class-list">
            <br />
            <br />
            <button id="add-class-button" onClick={toggleForm}>Add new class</button>
            <AddClass updateList={() => setUpdate(update + 1)} toggleForm={toggleForm} />
            <table>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Name</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {classes.map(c => <ClassListItem key={c.id} c={c} />)}
                </tbody>
            </table>
        </div>
    );
}

/* Handles adding a new class */
const AddClass = (props: { updateList: () => void, toggleForm: () => void }) => {
    const adminId = useContext(AdminContext);
    const [class_, setClass] = useState({
        name: ""
    });

    const onChange = (event: React.ChangeEvent) => {
        event.preventDefault();
        const name = (event.target as any).name;
        const value = (event.target as any).value;

        setClass({ ...class_, [name]: value });
    }
    const onSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const bearer = "Bearer " + sessionStorage.getItem("jwt");
        await fetch(`${apiLink}/admins/${adminId}/classes`, {
            method: "post",
            headers: {
                'Authorization': bearer,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(class_)
        })
            .then(res => res.json())
            .then(res => {
                if (res.status === "OK") {
                    alert("Class added");
                    props.toggleForm();
                    props.updateList();
                } else {
                    alert(res.message);
                }
            }).catch(_ => alert("Something went wrong!"));
    }
    const cancel = (event: React.MouseEvent) => {
        event.preventDefault();
        props.toggleForm();
    }
    return (
        <form onSubmit={onSubmit} id="add-class-form" className="hide">
            <label>
                Schedule name:
                <input type="text" name="name" value={class_.name} onChange={onChange} />
            </label>
            <button>Add</button>
            <button onClick={cancel}>Cancel</button>
        </form>
    );
}

/* Displays a single item in the class list */
const ClassListItem = ({ c }: { c: Class }) => {
    const { url } = useRouteMatch();

    return (
        <tr>
          <td>{c.id}</td>
          <td>{c.name}</td>
          <td><Link to={`${url}/${c.id}`}>VIEW</Link></td>
        </tr>
    );
}


export default ClassesRoute;
