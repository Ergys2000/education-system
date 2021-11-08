import React, { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AdminContext } from '../Admin';
import apiLink from '../../API';
import {days} from './ScheduleDefinitions';

interface ModifyNameProps {
	name: string
	index: number
	dayId: number
	close: () => void
	updateSchedule: () => void
}

const ModifyNamePopup = (props: ModifyNameProps) => {

  const adminId = useContext(AdminContext);
  const { scheduleId } = useParams() as any;
  const [day, setDay] = useState({
    name: props.name,
    day_index: props.index
  });

  const closePopup = (event: any) => {
    event.preventDefault();
    props.close();
  }

  const onChange = (event: any) => {
    event.preventDefault();
    const value = event.target.value;
    setDay(days[value - 1]);
  }

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const bearer = "Bearer " + sessionStorage.getItem("jwt");
    fetch(`${apiLink}/admins/${adminId}/schedules/${scheduleId}/days/${props.dayId}`, {
      headers: {
        'Authorization': bearer,
        'Content-Type': 'application/json'
      },
      method: "put",
      body: JSON.stringify(day)
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === "OK") {
          alert("Day updated!");
        } else {
          alert(res.message);
        }
        props.close();
        props.updateSchedule();
      }).catch(_ => console.log(_));
  }

	const deleteDay = (event: any) => {
		event.preventDefault();
    const bearer = "Bearer " + sessionStorage.getItem("jwt");
    fetch(`${apiLink}/admins/${adminId}/schedules/${scheduleId}/days/${props.dayId}`, {
      headers: {
        'Authorization': bearer
      },
      method: "delete"
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === "OK") {
          alert("Day deleted!");
        } else {
          alert(res.message);
        }
        props.close();
        props.updateSchedule();
      }).catch(_ => console.log(_));
	}

  return (
    <div className="popup">
      <form onSubmit={onSubmit}>
        <label>
          Select a day:
        <select value={day.day_index} onChange={onChange}>
            <option>Choose one</option>
            {days.map(day => <option key={day.day_index} value={day.day_index}>{day.name}</option>)}
          </select>
        </label>
        <button>Update</button>
        <button className="danger" onClick={deleteDay}>Delete</button>
        <button onClick={closePopup}>Close</button>
      </form>
    </div>
  );
}

export default ModifyNamePopup;
