import React, { useEffect, useState } from "react";
import { getColorForCourse } from '../Utils';

type Event = {
	id: number;
	title: string;
	description: string;
	due: string;
	classInstanceID: number | null
}
type EventImage = {
	id: number;
	filename: string;
	eventID: number;
}

const months = [
	"Jan", "Feb", "Mar", "Apr",
	"May", "Jun", "Jul", "Aug",
	"Sep", "Oct", "Nov", "Dec"
];

/* this component is responsible for displaying the school events */
function Events(props: { eventsApiLink: string }) {
	/* Fetch the events from the api */
	const [events, setEvents] = useState<Event[]>([]);
	useEffect(() => {
		const fetchEvents = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = "Bearer " + token;
			await fetch(props.eventsApiLink, {
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
				{events.map(event => <Event key={event.id} event={event} eventsApiLink={props.eventsApiLink} />)}
			</div>
		</div>
	);
}

/* displays a single event */
function Event(props: { event: Event, eventsApiLink: string }) {
	/* Decides whether of not the event viewer for this event is displayed */
	const [showEventViewer, setShowEventViewer] = useState<boolean>(false);

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
		borderRadius: '1rem 0 0 1rem'
	};
	return (
		<div className="event">

			<div style={style} className="event__date" onClick={() => setShowEventViewer(true)}>
				<p className="event__date__day"><b>{day}</b></p>
				<p className="event__date__month">{month}</p>
			</div>

			<div className="event__description">
				<h4>{e.title}</h4>
				<p>{e.classInstanceID ? "Class" : "School"}</p>
			</div>

			{showEventViewer
				? <EventViewer
					eventsApiLink={props.eventsApiLink}
					event={props.event}
					close={() => setShowEventViewer(false)}
				/>
				: null}
		</div>
	);
}

/* This component displays as a popup window to show details and photos of an
* event */
const EventViewer = (props: { event: Event, close: () => void, eventsApiLink: string }) => {
	/* The state used to hold the images, these are returned from the
	* api */
	const [images, setImages] = useState<EventImage[]>([]);
	useEffect(() => {
		const fetchImages = async () => {
			const bearer = "Bearer " + sessionStorage.getItem("jwt");
			await fetch(`${props.eventsApiLink}/${props.event.id}/images`, {
				headers: {
					'Authorization': bearer
				}
			}).then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setImages(res.result);
					} else {
						console.log(res.message);
					}
				}).catch(err => console.log(err));
		}

		fetchImages();
	}, [props.eventsApiLink, props.event.id]);


	return (
		<div className="event-viewer" >

			<div className="event-viewer__info">
				<div className="info-header">
					<h2>{props.event.title}</h2>
					<i className="material-icons" onClick={() => props.close()}>close</i>
				</div>

				<div className="info-description">
					<p>{props.event.description}</p>
				</div>
				<ImageList
					imageLinks={images.map(image =>
						`${props.eventsApiLink}/${props.event.id}/images/${image.filename}`
					)}
				/>
			</div>

		</div>
	);
}

const ImageList = (props: { imageLinks: string[] }) => {
	return (
		<div className="image-list">
			<h3>Images:</h3>
			<div className="image-list__images">
				{props.imageLinks.map((link, index) => <Image key={index} imageLink={link} />)}
			</div>
		</div>
	);
}

const Image = (props: { imageLink: string }) => {
	/* This state defines whether of not an image is fullscreen */
	const [fullScreen, setFullScreen] = useState(false);

	return (
		<span className={fullScreen ? "fullscreen" : ""}>
			<img
				onClick={() => setFullScreen(!fullScreen)} src={props.imageLink} />
		</span>
	);
}

export default Events;
