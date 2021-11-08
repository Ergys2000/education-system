import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import apiLink from '../../API';
import { AdminContext } from '../Admin';
import {Course, Hour, ScheduleSettings, calculateLength} from './ScheduleDefinitions';


/* Displays an hour block */
const HourComponent = (props: { hour: Hour, updateDay: () => void }) => {
	const [popup, setPopup] = useState(false);
	const hour = props.hour;

	const showModifyHour = () => {
		if (popup) return;
		setPopup(true);
	}

	/* Define the dynamically calculated style of the hour block */
	const hourStyle = {
		/* Defines the width of the hour to be 60 pixels less than the whole block */
		width: ScheduleSettings.dayWidth - 60,
		/* Defines the height be multiplying the length of the hour with the
		 * pixerPerMinute setting */
		height: calculateLength(hour.start, hour.end) * ScheduleSettings.pixelPerMinute,
		/* Defines the displacement from the first hour ("8:00") */
		top: calculateLength("8:00", hour.start) * ScheduleSettings.pixelPerMinute,
		/* Centers the hour inside the block */
		left: 30,
		right: 30
	};

	/* Split the hours to have access to the [hour, minute, second] */
	const start_split = hour.start.split(":");
	const end_split = hour.end.split(":");

	return (
		<div className="hour" style={hourStyle} onClick={showModifyHour}>
			<p>{hour.course_name}</p>

			{/* I had to do this monstrosity because the default format of the hours also shows the seconds */}
			<p>{`${start_split[0]}:${start_split[1]}`} - {`${end_split[0]}:${end_split[1]}`}</p>

			{popup ? 
				(<ModifyHour close={() => setPopup(!popup)} hour={hour} updateDay={props.updateDay} />) 
				: null}
		</div>
	);
}

/* Displays the popup used to modify the hour */
const ModifyHour = (props: { close: () => void, hour: Hour, updateDay: () => void }) => {
	const adminId = useContext(AdminContext);
	const { scheduleId } = useParams() as any;
	const [hour, setHour] = useState({
		courseInstanceID: props.hour.courseInstanceID,
		start: props.hour.start,
		end: props.hour.end
	});

	const [courseInstances, setCourseInstances] = useState<Course[]>([]);
	useEffect(() => {
		const fetchCourses = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = "Bearer " + token;
			await fetch(`${apiLink}/admins/${adminId}/courseInstances`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setCourseInstances(res.result);
					} else {
						alert(res.message);
					}
				});
		}
		fetchCourses();
	}, [adminId]);

	const cancel = (event: React.MouseEvent) => {
		event.preventDefault();
		props.close();
	}

	const onChange = (event: React.ChangeEvent) => {
		event.preventDefault();
		const name = (event.target as any).name;
		const value = (event.target as any).value;

		setHour({ ...hour, [name]: value });
	}

	const onSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		const bearer = "Bearer " + sessionStorage.getItem("jwt");
		const url =
			`${apiLink}/admins/${adminId}/schedules/${scheduleId}/days/${props.hour.dayID}/hours/${props.hour.id}`;
		fetch(url, {
			method: 'put',
			headers: {
				"Authorization": bearer,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(hour)
		})
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					alert("Hour updated!");
				} else {
					alert(res.message);
				}
				props.updateDay();
				props.close();
			}).catch(_ => console.log(_));
	}

	const deleteHour = (event: any) => {
		event.preventDefault();
		const bearer = "Bearer " + sessionStorage.getItem("jwt");
		const url =
			`${apiLink}/admins/${adminId}/schedules/${scheduleId}/days/${props.hour.dayID}/hours/${props.hour.id}`;
		fetch(url, {
			method: 'delete',
			headers: {
				"Authorization": bearer
			}
		})
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					alert("Hour deleted!");
				} else {
					alert(res.message);
				}
				props.updateDay();
				props.close();
			}).catch(_ => console.log(_));

	}

	return (
		<div className="popup">
			<form onSubmit={onSubmit}>
				<h3>Modify this hour</h3>
				<label>
					Choose a course:
					<select name="courseInstanceID" value={hour.courseInstanceID} onChange={onChange}>
						<option value={0}>Choose one</option>
						{courseInstances.map(ci =>
							<option value={ci.id}>
								{`${ci.course_name} - ${ci.firstname} ${ci.lastname}`}
							</option>
						)}
					</select>
				</label>
				<label>
					Start time:
				<input name="start" type="time" value={hour.start} onChange={onChange} />
				</label>
				<label>
					End time:
				<input name="end" type="time" value={hour.end} onChange={onChange} />
				</label>
				<button>Modify</button>
				<button className="danger" onClick={deleteHour}>Delete</button>
				<button onClick={cancel}>Cancel</button>
			</form>
		</div>
	);
}

export default HourComponent;
