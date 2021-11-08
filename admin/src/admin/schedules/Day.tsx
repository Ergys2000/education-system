import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import apiLink from '../../API';
import { AdminContext } from '../Admin';
import Block from './Block';
import HourComponent from './Hour';
import ModifyDay from './ModifyDay';
import {Day, Hour} from './ScheduleDefinitions';

interface DayProps {
	day: Day
	last: boolean
	updateSchedule: () => void
}

const DayComponent = ({ day, last, updateSchedule }: DayProps) => {
	const adminId = useContext(AdminContext);
	const [popup, setPopup] = useState(false);

	const [hours, setHours] = useState<Hour[]>([]);
	const [update, setUpdate] = useState(0);
	useEffect(() => {
		const fetchHours = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = 'Bearer ' + token;
			await fetch(`${apiLink}/admins/${adminId}/schedules/${day.scheduleID}/days/${day.id}/hours`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setHours(res.result);
					} else {
						alert(res.message);
					}
				}).catch(_ => console.log(_));
		}
		fetchHours();

	}, [adminId, update]);


	let blocks = [];
	for (let i = 0; i < 12; i++) {
		blocks.push(<Block key={day.id * i} dayId={day.id} updateDay={() => setUpdate(update + 1)} />);
	}
	let lastClass = "";
	if (last) lastClass = "last";

	const modifyHour = () => {
		if (popup) return;
		setPopup(true);
	}
	return (
		<div className="day-container">
			<h4 onClick={modifyHour}>
				{day.name}
				<i className="material-icons">create</i>
			</h4>
			<div className={`day ${lastClass}`}>
				{blocks}
				{hours.map(hour => <HourComponent key={hour.id} hour={hour} updateDay={() => setUpdate(update + 1)} />)}
			</div>
			{popup
				? <ModifyDay name={day.name}
					index={day.day} dayId={day.id}
					close={() => setPopup(false)}
					updateSchedule={updateSchedule} />
				: null}
		</div>
	);
}

export default DayComponent;
