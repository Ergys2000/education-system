import React, { useContext, useState, useEffect } from 'react';
import { useRouteMatch, useParams, Switch, Route, Link } from 'react-router-dom';
import { AdminContext } from './Admin';
import apiLink from '../API';
import { validateEmail, validateNameString, validateGender } from '../Utils';

type Gender = "male" | "female";
interface Admin {
    id?: number
    firstname: string
    lastname: string
    email: string
    password: string
    age: number
    gender: Gender
    access: string
}

/* Defines the admin route */
const Admins = () => {
    const { path } = useRouteMatch();
    return (
        <div>
            <Switch>
                <Route exact path={`${path}/`}>
                    <AdminList />
                </Route>
                <Route exact path={`${path}/:adminViewId`}>
                    <AdminView />
                </Route>
            </Switch>
        </div>
    );
}

/* Displays the list of all admin */
const AdminList = () => {
    interface Admin {
        id: number
        firstname: string
        lastname: string
        access: string
    }
    const adminId = useContext(AdminContext);

    /* Browser history and the current url */
    const { url } = useRouteMatch();

    /* Getting the list of admins */
    const [update, setUpdate] = useState(0);
    const [admins, setAdmins] = useState<Admin[]>([]);
    useEffect(() => {
        const fetchAdmins = async () => {
            const token = sessionStorage.getItem("jwt");
            const bearer = 'Bearer ' + token;
            await fetch(`${apiLink}/admins/${adminId}/admins`, {
                headers: {
                    'Authorization': bearer
                }
            })
                .then(res => res.json())
                .then(res => {
                    if (res.status === "OK") {
                        setAdmins(res.result);
                    } else {
                        alert(res.message);
                    }
                }).catch(_ => alert("Something went wrong!"));
        }
        fetchAdmins();
    }, [adminId, update]);

    const toggleForm = () => {
        const form = document.getElementById("add-teacher-form");
        const button = document.getElementById("add-teacher-button");
        form?.classList.toggle("hide");
        button?.classList.toggle("hide");
    }

    return (
        <div className="teacher-list">
            <br />
            <br />
            <button onClick={toggleForm} id="add-teacher-button">Add new admin</button>
            <AddAdmin updateList={() => setUpdate(update + 1)} toggleForm={toggleForm} />
            <table>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Firstname</th>
                        <th>Lastname</th>
                        <th>Access level</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {admins.map(admin => (
                        <tr key={admin.id}>
                            <td>{admin.id}</td>
                            <td>{admin.firstname}</td>
                            <td>{admin.lastname}</td>
                            <td>{admin.access}</td>
                            <td><Link to={`${url}/${admin.id}`}>VIEW</Link></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/* Displays the update page for a single admin */
const AdminView = () => {
    const adminId = useContext(AdminContext);
    const { adminViewId } = useParams() as any;

    /* Holds the form state about the admin */
    const [admin, setAdmin] = useState<Admin>({
        id: -1,
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        age: 0,
        gender: "male",
        access: ""
    });
    useEffect(() => {
        const fetchAdmin = async () => {
            const token = sessionStorage.getItem("jwt");
            const bearer = 'Bearer ' + token;
            await fetch(`${apiLink}/admins/${adminId}/admins/${adminViewId}`, {
                headers: {
                    'Authorization': bearer
                }
            })
                .then(res => res.json())
                .then(res => {
                    if (res.status === "OK") {
                        setAdmin(res.result);
                    } else {
                        alert(res.message);
                    }
                }).catch(_ => alert("Something went wrong!"));
        }
        fetchAdmin();
    }, [adminId, adminViewId]);

    /* Handles submitting the form information to the api
    * in this case it updates the Admin
    * */
    const onSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        /* Perform validations */
        if (!validateEmail(admin.email)) {
            alert("Wrong email format!");
            return;
        }
        if (!validateGender(admin.gender)) {
            alert("Wrong gender text");
            return;
        }
        if (!validateNameString(admin.firstname) || !validateNameString(admin.lastname)) {
            alert("Wrong values at text fields!");
            return;
        }

        const token = sessionStorage.getItem("jwt");
        const bearer = 'Bearer ' + token;
        await fetch(`${apiLink}/admins/${adminId}/admins/${adminViewId}`, {
            method: 'put',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': bearer
            },
            body: JSON.stringify(admin)
        })
            .then(res => res.json())
            .then(res => {
                if (res.status === "OK") {
                    alert("Admin updated successfully");
                } else {
                    alert(res.message);
                }
            }).catch(_ => alert("Something went wrong"));
    }

    /* Handles the changes made to the form data, performs validation */
    const handleChange = (event: React.ChangeEvent) => {
        event.preventDefault();
        const name = (event.target as any).name;
        const value = (event.target as any).value;

        setAdmin({ ...admin, [name]: value });
    }

    const deleteAdmin = async () => {
        const token = sessionStorage.getItem("jwt");
        const bearer = "Bearer " + token;
        await fetch(`${apiLink}/admins/${adminId}/admins/${adminViewId}`, {
            method: 'delete',
            headers: {
                'Authorization': bearer
            }
        })
            .then(res => res.json())
            .then(res => {
                res.status === "OK"
                    ? alert("Admin deleted")
                    : alert(res.message);
            })
    }

    return (
        <div>
            <div className="teacher">
                <h2>Update profile info</h2>
                <form className="teacher-form" onSubmit={onSubmit}>
                    <label>
                        Firstname:
                        <input onChange={handleChange} name="firstname" value={admin.firstname} />
                    </label>
                    <label>
                        Lastname:
                        <input onChange={handleChange} name="lastname" value={admin.lastname} />
                    </label>
                    <label>
                        Email:
                        <input type="email" onChange={handleChange} name="email" value={admin.email} />
                    </label>
                    <label>
                        Password:
                        <input type="text" onChange={handleChange} name="password" value={admin.password} />
                    </label>
                    <label>
                        Age:
                        <input type="number" min={18} max={100} onChange={handleChange} name="age" value={admin.age} />
                    </label>
                    <label>
                        Gender:
                        <input onChange={handleChange} name="gender" value={admin.gender} />
                    </label>
                    <label>
                        Access:
                        <select onChange={handleChange} name="access" value={admin.access}>
                            <option value="user">User</option>
                            <option value="supervisor">Supervisor</option>
                        </select>
                    </label>
                    <button>Update</button>
                </form>
                <button className="danger" onClick={deleteAdmin}>Delete Admin</button>
            </div>
        </div>
    );
}

/* Handles adding a admin */
const AddAdmin = (props: { updateList: () => void, toggleForm: () => void }) => {
    const adminId = useContext(AdminContext);

    const [admin, setAdmin] = useState<Admin>({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        age: 18,
        gender: "male",
        access: "supervisor"
    });

    const handleChange = (event: React.ChangeEvent) => {
        event.preventDefault();
        const name = (event.target as any).name;
        const value = (event.target as any).value;

        setAdmin({ ...admin, [name]: value });
    }

    const onSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!validateGender(admin.gender)) {
            alert("wrong gender value");
            return;
        }

        for (const value of Object.values(admin)) {
            if (value === "") {
                alert("You cannot have empty values!");
                return;
            }
        }

        const token = sessionStorage.getItem("jwt");
        const bearer = 'Bearer ' + token;
        await fetch(`${apiLink}/admins/${adminId}/admins`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': bearer
            },
            body: JSON.stringify(admin)
        })
            .then(res => res.json())
            .then(res => {
                if (res.status === "OK") {
                    alert("Admin added!");
                    props.updateList();
                    props.toggleForm();
                } else {
                    alert(res.message);
                    props.toggleForm();
                }
            }).catch(_ => alert("Something went wrong"));
    }

    const cancel = (event: React.MouseEvent) => {
        event.preventDefault();
        props.toggleForm();
    }

    return (
        <form onSubmit={onSubmit} className="hide" id="add-teacher-form">
            <h2>Add a admin</h2>
            <label>
                Firstname:
                <input type='text' name="firstname" value={admin.firstname} onChange={handleChange} />
            </label>
            <label>
                Lastname:
                <input type='text' name="lastname" value={admin.lastname} onChange={handleChange} />
            </label>
            <label>
                Email:
                <input type='email' name="email" value={admin.email} onChange={handleChange} />
            </label>
            <label>
                Password:
                <input type='text' name="password" value={admin.password} onChange={handleChange} />
            </label>
            <label>
                Age:
                <input type='number' name="age" value={admin.age} onChange={handleChange} min={18} max={100} step={1} />
            </label>
            <label>
                Gender:
                <input type='text' name="gender" value={admin.gender} onChange={handleChange} />
            </label>
            <label>
                Access level:
                <select name="access" value={admin.access} onChange={handleChange} >
                    <option value={"supervisor"}>Supervisor</option>
                    <option value={"user"}>User</option>
                </select>
            </label>
            <button type="submit">Add admin</button>
            <button onClick={cancel}>Cancel</button>
        </form>
    );
}

export default Admins;
