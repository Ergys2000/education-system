import React, { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AdminContext } from '../Admin';
import apiLink from '../../API';
import {days} from './ScheduleDefinitions';


/* Handles adding a new day into the schedule */
const DayForm = (props: {
  toggleForm: () => void,
  updateSchedule: () => void
}) => {
  const adminId = useContext(AdminContext);
  const { scheduleId } = useParams() as any;

  const [day, setDay] = useState({
    name: "",
    day_index: 0, /* The ordering index of the day, example: Monday=1, Tuesday=2 */
  });

  const onChange = (event: React.ChangeEvent) => {
    event.preventDefault();
    const value = (event.target as any).value;

    setDay(days[value-1]);
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    props.toggleForm();
    if(day.day_index === 0) {
      alert("Please make sure to choose a day!");
      return;
    }
    const token = sessionStorage.getItem("jwt");
    const bearer = "Bearer " + token;
    await fetch(`${apiLink}/admins/${adminId}/schedules/${scheduleId}/days`, {
      method: 'post',
      headers: {
        'Authorization': bearer,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(day)
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === "OK") {
          alert("Day successfully added");
          props.updateSchedule();
        } else {
          alert("Please make sure a day with this index does not exist!");
        }
      }).catch(_ => alert("Something went wrong"));
  }

  const cancel = (event: React.FormEvent) => {
    event.preventDefault();
    props.toggleForm();
  }

  return (
    <form id="day-form" onSubmit={onSubmit} className="hide">
      <label>
        Select a day:
        <select value={day.day_index} onChange={onChange}>
          <option>Choose one</option>
          {days.map(day => <option key={day.day_index} value={day.day_index}>{day.name}</option>)}
        </select>
      </label>
      <button>Add</button>
      <button onClick={cancel}>Cancel</button>
    </form>
  );
}

export default DayForm;
