import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AdminContext } from "../../admin/Admin";
import apiLink from "../../API";

interface ClassInstance {
    name: string
    year: number
    classID: number
    scheduleID: number
    teacherID: number
}

interface Teacher {
    id: number
    firstname: string
    lastname: string
}

interface Schedule {
    id: number
    name: string
}

const AddClassInstance = (props: { updateList: () => void, toggleForm: () => void }) => {
    const adminId = useContext(AdminContext);
    const { classId } = useParams() as any;
    const [classInstance, setClassInstance] = useState<ClassInstance>({
        name: "",
        year: 2020,
        classID: classId,
        scheduleID: 0,
        teacherID: 0
    });

    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    useEffect(() => {
        const bearer = "Bearer " + sessionStorage.getItem("jwt");
        const fetchData = async () => {
            /* Fetch the schedules */
            await fetch(`${apiLink}/admins/${adminId}/schedules`, {
                headers: {
                    'Authorization': bearer
                }
            })
                .then(res => res.json())
                .then(res => {
                    if (res.status === "OK") {
                        setSchedules(res.result);
                        /* Also set the schedule id in the form to be the first
                        * one*/
                        if (res.result.length > 0) {
                            setClassInstance({ ...classInstance, scheduleID: res.result[0].id });
                        }
                    } else {
                        alert("Error with getting the schedules.")
                    }
                }).catch(_ => alert("Error with getting the schedules"));
            /* Fetch the teachers */
            await fetch(`${apiLink}/admins/${adminId}/teachers`, {
                headers: {
                    'Authorization': bearer
                }
            })
                .then(res => res.json())
                .then(res => {
                    if (res.status === "OK") {
                        setTeachers(res.result);
                        /* Also set the teacher id in the form to be the first
                        * one*/
                        if (res.result.length > 0) {
                            setClassInstance({ ...classInstance, teacherID: res.result[0].id });
                        }
                    } else {
                        alert("Error with getting the teachers")
                    }
                }).catch(_ => alert("Error with getting the teachers"));
        }

        fetchData();
    }, [adminId]);

    const onChange = (event: React.ChangeEvent) => {
        event.preventDefault();
        const name = (event.target as any).name;
        const value = (event.target as any).value;

        setClassInstance({ ...classInstance, [name]: value });
    }
    const onSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const bearer = "Bearer " + sessionStorage.getItem("jwt");
        const scheduleID = classInstance.scheduleID === 0 ? null : classInstance.scheduleID;
        const body = {...classInstance, 'scheduleID': scheduleID};
        await fetch(`${apiLink}/admins/${adminId}/classInstances`, {
            method: "post",
            headers: {
                'Authorization': bearer,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
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
                Class name:
                <input type="text" name="name" value={classInstance.name} onChange={onChange} />
            </label>
            <label>
                Year:
                <input type="number" name="year" value={classInstance.year} onChange={onChange} />
            </label>
            <label>
                Head Teacher:
                <select name="teacherID" value={classInstance.teacherID} onChange={onChange}>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.firstname + " " + t.lastname}</option>)}
                </select>
            </label>
            <label>
                Schedule:
                <select name="scheduleID" value={classInstance.scheduleID} onChange={onChange}>
                    <option value={0}>None</option>
                    {schedules.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </label>
            <button>Add</button>
            <button onClick={cancel}>Cancel</button>
        </form>
    );
}


export default AddClassInstance;
