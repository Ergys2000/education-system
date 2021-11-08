import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import apiLink from '../../API';
import { AdminContext } from '../Admin';
import DayForm from './DayForm';
import DayComponent from './Day';
import {Day} from './ScheduleDefinitions';

/* Displays a particular schedule */
const Schedule = () => {
	const adminId = useContext(AdminContext);
	const { scheduleId } = useParams() as any;
	const [days, setDays] = useState<Day[]>([]);

	/* Used to refetch the schedule */
	const [update, setUpdate] = useState(0);
	useEffect(() => {
		const fetchDays = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = 'Bearer ' + token;
			await fetch(`${apiLink}/admins/${adminId}/schedules/${scheduleId}/days`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setDays(res.result);
					} else {
						alert(res.message);
					}
				}).catch(_ => console.log(_));
		}

		fetchDays();
	}, [adminId, update]);

	/* Toggles the visibility of the form that adds a new day */
	const toggleForm = (): void => {
		let dayForm = document.getElementById("day-form");
		let addButton = document.getElementById("schedule-form-button");
		dayForm?.classList.toggle("hide");
		addButton?.classList.toggle("hide");
	}

	return (
		<div className="schedule-container">

			<button onClick={toggleForm} id="schedule-form-button">Add new day</button>
			{/* Component for adding a new day */}
			<DayForm toggleForm={toggleForm} updateSchedule={() => setUpdate(update + 1)} />

			<div className="calendar">
				<Timeline />
				{days.map((day, index) => (
						<DayComponent key={day.id} day={day} last={index === days.length - 1} updateSchedule={() => setUpdate(update+1)} />
				))}
			</div>
		</div>
	);
}

/* Displays a the list of hours */
const Timeline = () => {
	let hours = [];
	for (let i = 0; i < 12; i++) {
		hours.push(<p key={i}>{8 + i}:00</p>);
	}
	return (
		<div className="timeline">
			{hours}
		</div>
	);
}

export default Schedule;
