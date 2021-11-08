import React from 'react';
import { getColorForCourse } from '../Utils';

/* The schedule types */
export interface Day {
	id: number
	name: string
	hours: Hour[]
	day: number
}
export interface Hour {
	id: number
	course_name: string
	course_category: string
	courseInstanceID: number
	start: string
	end: string
}

/* The schedule settings, it defines the width of each day in pixels
* and also the height of each hour using the pixerPerMinute field */
const ScheduleSettings = {
	pixelPerMinute: 2,
	dayWidth: 200
};

/* Utility function used to calculate length between two times ("8:45")
 * Params:
 *  - start: string -- defines the start time,
 *  - end: string -- defines the end time
 * Returns:
 *  - length: number -- the length of the distance between the two times
 * */
const calculateLength = (start: string, end: string): number => {
	const [s_h, s_m] = start.split(":");
	const [e_h, e_m] = end.split(":");
	const interval_length = (parseInt(e_h) - parseInt(s_h)) * 60
		+ (parseInt(e_m) - parseInt(s_m));
	return interval_length;
}

/* Displays the schedule */
const Schedule = (props: {days: Day[]}) => {
	const days = props.days;
	return (
		<div className="schedule">
			<header>
				<h2>Schedule</h2>
			</header>
			<section>
				<Timeline />
				{days.map((day, index) => (
					<div className={"day-container"}>
						<h4>{day.name}</h4>
						<Day day={day} last={index === days.length - 1} />
					</div>
				))}
			</section>
		</div>
	);
}

/* Displays a column of times */
const Timeline = () => {
	let hours = [];
	for (let i = 0; i < 12; i++) {
		hours.push(<p>{8 + i}:00</p>);
	}
	return (
		<div className="timeline">
			{hours}
		</div>
	);
}

/* Displays a single day column */
const Day = (props: { day: Day, last: boolean }) => {
	let blocks = [];
	const blockStyle = {
		width: ScheduleSettings.dayWidth,
		height: ScheduleSettings.pixelPerMinute * 60 - 1
	};
	for (let i = 0; i < 12; i++) {
		blocks.push(<div className="block" style={blockStyle}></div>);
	}
	let last = "";
	if (props.last) last = "last";
	return (
		<div className={`day ${last}`}>
			{blocks}
			{props.day.hours.map(hour => <Hour key={hour.id} hour={hour} />)}
		</div>
	);
}

/* Displays a single hour */
const Hour = (props: { hour: Hour }) => {
	const hour = props.hour;
	const start_split = hour.start.split(":");
	const end_split = hour.end.split(":");
	const hourStyle = {
		width: ScheduleSettings.dayWidth - 60,
		height: calculateLength(hour.start, hour.end) * ScheduleSettings.pixelPerMinute,
		top: calculateLength("8:00", hour.start) * ScheduleSettings.pixelPerMinute,
		left: 30,
		right: 30,
    backgroundColor: getColorForCourse(hour.courseInstanceID),
    color: '#000'
	};
	return (
		<div className="hour" style={hourStyle}>
			<p>{hour.course_name}</p>
			<p>{`${start_split[0]}:${start_split[1]}`} - {`${end_split[0]}:${end_split[1]}`}</p>
		</div>
	);
}

export default Schedule;
