import React, { useContext, useState, useEffect } from 'react';
import { Switch, Route, useRouteMatch, useHistory, useParams, Link } from 'react-router-dom';
import apiLink from '../API';
import { AdminContext } from './Admin';

interface Event {
	id: number,
	title: string,
	description: string,
	classInstanceID: number,
	due: string
}

interface EventImage {
	id: number
	filename: string
	eventID: number
}

interface ClassInstance {
	id: number;
	name: string;
}

/* The event page route definition */
const Events = () => {
	const { path } = useRouteMatch();
	return (
		<Switch>
			<Route exact path={`${path}/`}>
				<EventList />
			</Route>
			<Route exact path={`${path}/:eventId`}>
				<EventView />
			</Route>
		</Switch>
	);
}

/* Displays the list of all the events */
const EventList = () => {
	const adminId = useContext(AdminContext);
	const { url } = useRouteMatch();

	/* State used to represent the events */
	const [updateList, setUpdateList] = useState(0);
	const [events, setEvents] = useState<Event[]>([]);
	useEffect(() => {
		const fetchEvents = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = 'Bearer ' + token;
			await fetch(`${apiLink}/admins/${adminId}/events`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setEvents(res.result);
					} else {
						alert(res.message);
					}
				});
		}
		fetchEvents();
	}, [adminId, updateList]);

	const [addEvent, setAddEvent] = useState(false);

	/* Makes a delete request the events api */
	const deleteDoneEvents = async () => {
		const bearer = "Bearer " + sessionStorage.getItem("jwt");
		await fetch(`${apiLink}/admins/1/events`, {
			method: 'delete',
			headers: {
				'Authorization': bearer
			}
		})
			.then(res => res.json())
			.then(res => {
				alert(res.message)
			}).catch(_ => alert("Something went wrong"));
	}

	return (
		<div className='event-list'>
			<br />
			{addEvent ? null : (
				<button onClick={() => setAddEvent(true)}>Add an event</button>
			)}
			{addEvent
				? (<AddEvent
					toggleForm={() => setAddEvent(false)}
					updateList={() => setUpdateList(updateList + 1)} />) 
				: null}
			<button className="danger" onClick={deleteDoneEvents}>Delete all done events</button>
			<table>
				<thead>
					<tr>
						<th>Id</th>
						<th>Title</th>
						<th>Description</th>
						<th>Class Instance Id</th>
						<th>Due</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{events.map(event => (
						<tr key={event.id}>
							<td>{event.id}</td>
							<td>{event.title}</td>
							<td>{event.description}</td>
							<td>{event.classInstanceID}</td>
							<td>{event.due}</td>
							<td><Link to={`${url}/${event.id}`}>VIEW</Link></td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

/* Displays the event view */
const EventView = () => {
	const adminId = useContext(AdminContext);
	const { eventId } = useParams() as any;
	const history = useHistory();

	/* The state used to represent the form data */
	const [event, setEvent] = useState<Event>({
		id: -1,
		title: "",
		description: "",
		classInstanceID: -1,
		due: ""
	});
	useEffect(() => {
		const fetchEvent = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = 'Bearer ' + token;
			await fetch(`${apiLink}/admins/${adminId}/events/${eventId}`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setEvent(res.result);
					} else {
						alert(res.message);
					}
				}).catch(_ => alert("Something went wrong, please try again later!"));
		}

		fetchEvent();
	}, [adminId, eventId]);

	/* Handles the changes in the form */
	const handleChange = (_event: React.ChangeEvent) => {
		_event.preventDefault();
		const name = (_event.target as any).name;
		const value = (_event.target as any).value;
		setEvent({ ...event, [name]: value });
	}

	const onSubmit = async (_event: React.FormEvent) => {
		_event.preventDefault();
		const token = sessionStorage.getItem("jwt");
		const bearer = 'Bearer ' + token;
		await fetch(`${apiLink}/admins/${adminId}/events/${eventId}`, {
			method: 'put',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': bearer
			},
			body: JSON.stringify(event)
		})
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					alert("Event update successfully");
				} else {
					alert(res.message);
				}
			}).catch(_ => alert("Something went wrong, please try again later!"));
	}

	const deleteEvent = async (event: React.FormEvent) => {
		event.preventDefault();
		const token = sessionStorage.getItem("jwt");
		const bearer = 'Bearer ' + token;
		await fetch(`${apiLink}/admins/${adminId}/events/${eventId}`, {
			method: 'delete',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': bearer
			}
		})
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					alert("Event deleted successfully");
				} else {
					alert(res.message);
				}
				history.goBack();
			}).catch(_ => alert("Something went wrong, please try again later!"));
	}

	return (
		<div className="event">
			<form onSubmit={onSubmit}>
				<h1>Event Details</h1>
				<label>
					Title:
                    <input name="title" value={event.title} onChange={handleChange} />
				</label>
				<label>
					Description:
                    <textarea name="description" onChange={handleChange} value={event.description} />
				</label>
				<label>
					Due:
                    <input type="datetime-local" name="due" value={event.due} onChange={handleChange} />
				</label>
				<button>Update</button>
				<button className="danger" onClick={deleteEvent}>Delete this event</button>
			</form>
			<div>
				<EventImages eventId={eventId} />
			</div>
		</div>
	);
}

/* This component handles adding a new event */
const AddEvent = (props: { toggleForm: () => void, updateList: () => void }) => {
	const adminId = useContext(AdminContext);
	/* Holds the event information displayed by the form */
	const [form, setForm] = useState({
		title: "",
		description: "",
		classInstanceID: 0,
		due: ""
	});
	/* Used to retrieve the class instances the user can choose from */
	const [classInstances, setClassInstances] = useState<ClassInstance[]>([]);
	useEffect(() => {
		const fetchClasses = async () => {
			const bearer = "Bearer " + sessionStorage.getItem("jwt");
			await fetch(`${apiLink}/admins/${adminId}/classInstances`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setClassInstances(res.result);
					} else {
						alert(res.message);
					}
				}).catch(err => console.log(err));
		}
		fetchClasses();
	}, [adminId]);

/* This function closes the event form */
	const close = (event: React.FormEvent) => {
		event.preventDefault();
		props.toggleForm();
	}

/* This functions updates the form fields */
	const onChange = (event: React.ChangeEvent) => {
		event.preventDefault();
		const { name, value } = (event.target as any);

		setForm({ ...form, [name]: value });
	}

/* Handles submitting the information to the api */
	const onSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		const bearer = "Bearer " + sessionStorage.getItem("jwt");
		fetch(`${apiLink}/admins/${adminId}/events`, {
			method: "post",
			headers: {
				'Authorization': bearer,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(form)
		}).then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					alert("The event was added successfully!");
					props.updateList();
					props.toggleForm();
				} else {
					alert(res.message);
				}
			}).catch(_ => console.log("An error occured"));
	}
	return (
		<div className="event-form">
			<form onSubmit={onSubmit}>
				<label>
					Title
					<input type="text" name="title" onChange={onChange} value={form.title} />
				</label>
				<label>
					Description
					<input type="text" name="description" onChange={onChange} value={form.description} />
				</label>
				<label>
					Class
					<select value={form.classInstanceID} onChange={onChange} name="classInstanceID">
						<option value={0}>General school event</option>
						{classInstances.map(classInstance =>
							<option key={classInstance.id} value={classInstance.id}>{classInstance.name}</option>
						)}
					</select>
				</label>
				<label>
					Due
					<input type="datetime-local" name="due" onChange={onChange} value={form.due} />
				</label>

				<button>Submit</button>
				<button onClick={close}>Close</button>
			</form>
		</div>
	);
}

const EventImages = (props: { eventId: number }) => {
	const adminId = useContext(AdminContext);

	const uploadImage = async (event: React.FormEvent) => {
		event.preventDefault();
		const form = event.target;
		const formData = new FormData(form as HTMLFormElement);
		await fetch(`${apiLink}/admins/${adminId}/events/${props.eventId}/images`, {
			method: 'post',
			body: formData
		})
			.then(res => res.json())
			.then(res => {
				alert(res.message);
			})
			.catch(err => console.log(err));
	}

	return (
		<div className="event-images">
			<ImageList eventId={props.eventId} />
			<form
				onSubmit={uploadImage}
				method="post"
				encType="multipart/form-data">
				<label>
					Upload a new image:
					<input type="file" name="file" />
				</label>
				<button>Upload Image</button>
			</form>
		</div>
	);
}

/* Displays the images of the event */
const ImageList = (props: { eventId: number }) => {
	const adminId = useContext(AdminContext);

	const [eventImages, setEventImages] = useState<EventImage[]>([]);

	useEffect(() => {
		const fetchImages = async () => {
			const bearer = "Bearer " + sessionStorage.getItem("jwt");
			await fetch(`${apiLink}/admins/${adminId}/events/${props.eventId}/images`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					console.log(res);
					if (res.status === 'OK') {
						setEventImages(res.result);
					} else {
						alert(res.message);
					}
				}).catch(_ => alert("Something went wrong"));
		}
		fetchImages();
	}, [adminId, props.eventId]);

	return (
		<div className="images">
			<h1>Event images</h1>
			{eventImages.map(eventImage => <img src={`${apiLink}/admins/${adminId}/events/${eventImage.eventID}/images/${eventImage.filename}`} />)}
		</div>
	);
}

export default Events;
