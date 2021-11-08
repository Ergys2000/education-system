import React, { useEffect, useState, useContext } from "react";
import apiLink from "../../API";
import { StudentContext } from "../Student";
import { getColorForCourse } from '../../Utils';

type Event = {
	id: number;
	title: string;
	description: string;
	due: string;
	classInstanceID: number | null
}

const months = [
	"Jan", "Feb", "Mar", "Apr",
	"May", "Jun", "Jul", "Aug",
	"Sep", "Oct", "Nov", "Dec"
];

/* this component is responsible for displaying the school events */
function Events(_props: any) {
	const studentId = useContext(StudentContext);

	/* Fetch the events from the api */
	const [events, setEvents] = useState<Event[]>([]);
	useEffect(() => {
		const fetchEvents = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = "Bearer " + token;
			await fetch(`${apiLink}/students/${studentId}/events`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setEvents(res.result);
					} else {
						(alert as any)("Error", res.message, "error");
					}
				}).catch(_ => console.log(_));
		}

		fetchEvents();
	}, []);

	return (
		<div className="events">
			<div className="head">
				<h3>Upcoming Events</h3>
			</div>
			<div className="events__list">
				{events.map(event => <Event key={event.id} event={event} />)}
			</div>
		</div>
	);
}

/* displays a single event */
function Event(props: { event: Event }) {
	const e = props.event;
	const date = new Date(e.due);

	/* Get the name of the month of the date */
	const month = months[date.getMonth()];

	/* Get the day and a 0 in front to make all the days contain two digits */
	const day = date.getDay() < 10 ? '0' + date.getDay() : date.getDay();

	/* Get a color for the color of the border
	*  And then dynamically set the border color of the date */
	const color = getColorForCourse(props.event.id);
	const style = {
		border: `2px solid ${color}`,
		borderRadius: '10px 0 0 10px'
	};
	return (
		<div className="event">
			<div style={style} className="event__date">
				<p className="event__date__day"><b>{day}</b></p>
				<p className="event__date__month">{month}</p>
			</div>
			<div className="event__description">
				<h4>{e.title}</h4>
				<p>{e.classInstanceID ? "Class" : "School"}</p>
			</div>
		</div>
	);
}

export default Events;
