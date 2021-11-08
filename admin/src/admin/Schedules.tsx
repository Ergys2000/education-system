import React, { useContext, useState, useEffect } from 'react';
import { Route, Switch, useRouteMatch, useHistory } from 'react-router-dom';
import { AdminContext } from './Admin';
import apiLink from '../API';
import ScheduleView from './schedules/ScheduleView';

interface Schedule {
  id: number
  name: string
}

/* Defines the route of the schedule page  */
const Schedule = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route exact path={`${path}/`}>
        <ScheduleList />
      </Route>
      <Route exact path={`${path}/:scheduleId`}>
        <ScheduleView />
      </Route>
    </Switch>
  );
}

/* Displays a list of schedules and their name */
const ScheduleList = () => {
  const adminId = useContext(AdminContext);
  const history = useHistory();
  const { url } = useRouteMatch();

  const [update, setUpdate] = useState(0);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  useEffect(() => {
    const fetchSchedules = async () => {
      const token = sessionStorage.getItem("jwt");
      const bearer = "Bearer " + token;
      await fetch(`${apiLink}/admins/${adminId}/schedules`, {
        headers: {
          'Authorization': bearer
        }
      })
        .then(res => res.json())
        .then(res => {
          if (res.status === "OK") {
            setSchedules(res.result);
          } else {
            alert(res.message);
          }
        }).catch(_ => alert("Something went wrong!"));
    }
    fetchSchedules();
  }, [adminId, update]);

  /* Toggles the visibility of the form that adds a new day */
  const toggleForm = (): void => {
    let scheduleForm = document.getElementById("schedule-form");
    let addButton = document.getElementById("add-schedule-button");
    scheduleForm?.classList.toggle("hide");
    addButton?.classList.toggle("hide");
  }

  const deleteSchedule = async (scheduleId: number) => {
    if (!window.confirm("Are you sure?")) {
      return;
    }
    const bearer = "Bearer " + sessionStorage.getItem("jwt");
    await fetch(`${apiLink}/admins/${adminId}/schedules/${scheduleId}`, {
      method: 'delete',
      headers: {
        'Authorization': bearer,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === "OK") {
          alert("Schedule deleted!");
          setUpdate(update + 1);
        } else {
          alert(res.message);
        }
      }).catch(_ => alert("Something went wrong!"));
  }


  return (
    <div className="schedule-list">
      <br />
      <br />
      <button onClick={toggleForm} id="add-schedule-button">Add new schedule</button>
      <AddSchedule updateList={() => setUpdate(update + 1)} toggleForm={toggleForm} />
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {schedules.map(schedule => (
            <tr key={schedule.id}>
              <td>{schedule.id}</td>
              <td>{schedule.name}</td>
              <td><button onClick={() => history.push(`${url}/${schedule.id}`)}>View</button></td>
              <td>
                <button onClick={() => deleteSchedule(schedule.id)} className="deleteBtn">
                  <i className="material-icons">delete</i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* Handles adding a new schedule */
const AddSchedule = (props: { updateList: () => void, toggleForm: () => void }) => {
  const adminId = useContext(AdminContext);
  const [schedule, setSchedule] = useState({
    name: ""
  });

  const onChange = (event: React.ChangeEvent) => {
    event.preventDefault();
    const name = (event.target as any).name;
    const value = (event.target as any).value;

    setSchedule({ ...schedule, [name]: value });
  }
  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const bearer = "Bearer " + sessionStorage.getItem("jwt");
    await fetch(`${apiLink}/admins/${adminId}/schedules`, {
      method: "post",
      headers: {
        'Authorization': bearer,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(schedule)
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === "OK") {
          alert("Schedule added");
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
    <form onSubmit={onSubmit} id="schedule-form" className="hide">
      <label>
        Schedule name:
        <input type="text" name="name" value={schedule.name} onChange={onChange} />
      </label>
      <button>Add</button>
      <button onClick={cancel}>Cancel</button>
    </form>
  );
}

export default Schedule;
