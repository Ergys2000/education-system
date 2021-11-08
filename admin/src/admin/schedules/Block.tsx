import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import apiLink from '../../API';
import { AdminContext } from '../Admin';
import {Course, ScheduleSettings} from './ScheduleDefinitions';

/* Displays an empty block in the schedule */
const Block = (props: { dayId: number, updateDay: () => void }) => {
	const [popup, setPopup] = useState<Boolean>(false);
	const blockStyle = {
		width: ScheduleSettings.dayWidth,
		height: ScheduleSettings.pixelPerMinute * 60 - 1
	};
	const addHour = () => {
		if (popup) return;
		setPopup(true);
	}
	return (
		<div className="block" style={blockStyle} onClick={addHour}>
			{popup === true ? (<AddHour close={() => setPopup(!popup)} dayId={props.dayId} updateDay={props.updateDay} />) : null}
		</div>
	);

}

/* The popup that adds a new hour */
const AddHour = (props: { close: () => void, dayId: number, updateDay: () => void }) => {
	const adminId = useContext(AdminContext);
	const { scheduleId } = useParams() as any;
	const [hour, setHour] = useState({
		dayId: props.dayId,
		courseInstanceID: 0,
		start: "",
		end: ""
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
		fetch(`${apiLink}/admins/${adminId}/schedules/${scheduleId}/days/${props.dayId}/hours`, {
			method: 'post',
			headers: {
				"Authorization": bearer,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(hour)
		})
			.then(res => res.json())
			.then(res => {
				console.log(res.result);
				if (res.status === "OK") {
					alert("Hour added!");
				} else {
					alert(res.message);
				}
				props.close();
				props.updateDay();
			}).catch(_ => console.log(_));
	}

	return (
		<div className="popup">
			<form onSubmit={onSubmit}>
				<h3>Add a new hour</h3>
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
				<button>Add</button>
				<button onClick={cancel}>Cancel</button>
			</form>
		</div>
	);
}

export default Block;
