import React, { useContext, useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { AdminContext } from './Admin';
import apiLink from '../API';

interface Event {
    id: number
    title: string
    description: string
    due: string
}

interface EventImage {
    id: number
    filename: string
    eventID: number
}

/* Will define the path of the home page */
const Home = () => {
    const { url, path } = useRouteMatch();
    return (
        <div className="option">
            <EventList />
        </div>
    );
}

/* Displays a list of events */
const EventList = () => {
    const adminId = useContext(AdminContext);

    /* State used to represent the events */
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
    }, [adminId]);
    return (
        <div className="event-list">
            {events.map(event => <EventListItem key={event.id} event={event} />)}
        </div>
    );
}

/* Displays a single event */
const EventListItem = (props: { event: Event }) => {
    return (
        <div className="event">
            <div className="head">
                <h3>{props.event.title}</h3>
                <p className="due"><b>Due: </b>{props.event.due} </p>
            </div>
            <div className="body">
                <p>{props.event.description}</p>
            </div>
            <ImageList eventId={props.event.id} />
        </div>
    );
}

/* Displays the images of a single event */
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
        <div className="image-list">
            {eventImages.map(eventImage => <Image filename={eventImage.filename} eventId={eventImage.eventID} />)}
        </div>
    );
}

/* Displays a single image. It is wrapped in a div component because when the
* image is clickes it is displayd full screen and a dim is added to the div
* container. */
const Image = (props: { filename: string, eventId: number }) => {
    const adminId = useContext(AdminContext);
    const [fullscreen, setFullscreen] = useState(false);
    return (
        <div className={fullscreen ? "fullscreen" : "normal"} >
            <img 
                onClick={() => setFullscreen(!fullscreen)}
                src={`${apiLink}/admins/${adminId}/events/${props.eventId}/images/${props.filename}`} />
        </div>
    );
}

export default Home;
