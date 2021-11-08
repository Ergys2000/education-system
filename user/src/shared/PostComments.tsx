import React, { useState, useContext } from 'react';
import apiLink from '../API.js';
import { convertDateString } from '../Utils';

/* A comment can be a student comment or a teacher comment,
* When it is a teacher comment 'teacherID' is a number and 'studentID' is null
* When it is a student comment 'studentID' is a number and 'teacherID' is null
* */
type Comment = {
	id: number;
	comment: string;
	commented_on: string;
	teacherID: number;
	studentID: number;
	firstname: string;
	lastname: string;
	postID: number;
};

/* The post context */
export const CommentsContext = React.createContext({
	postId: 0,
	updateList: () => console.log("Comment list"),
	deleteCommentUrl: "",
	postCommentUrl: "",
	courseId: 0,
	userId: 0,
	userType: ""
});

/* Display the comment section */
export const Comments = (props: { comments: Comment[] }) => {
	/* Determines whether the comment list is shown */
	const [shown, setShown] = useState(false);

	return (
		<div className="comment-list">
			<div className="comment-list__count" onClick={() => setShown(!shown)}>
				<i className="material-icons">chat</i>
				<p>{`${props.comments.length} comments`}</p>
			</div>
			{shown ? <CommentList comments={props.comments} /> : null}
			<div className="comment-list__form">
				<CommentForm />
			</div>
		</div>
	);
}

/* Displays a list of comments */
const CommentList = (props: { comments: Comment[] }) => {
	return (
		<div className="comment-list__comments">
			{props.comments.map(comment => <Comment key={comment.id} comment={comment} />)}
		</div>
	);
}

/* Displays a single comment */
const Comment = (props: { comment: Comment }) => {
	const { updateList, deleteCommentUrl, userId, userType } = useContext(CommentsContext);

	/* Decide on the url of the image, this depends on whether this is a user or
	 * a teacher comment */
	let imgSrc = "";
	if (props.comment.studentID) {
		imgSrc = `${apiLink}/students/${props.comment.studentID}/picture`;
	} else {
		imgSrc = `${apiLink}/teachers/${props.comment.teacherID}/picture`;
	}

	const deleteComment = (event: React.MouseEvent) => {
		event.preventDefault();
		const bearer = "Bearer " + sessionStorage.getItem("jwt");
		fetch(`${deleteCommentUrl}/${props.comment.id}`, {
			method: "delete",
			headers: {
				'Authorization': bearer
			}
		}).then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					(alert as any)("Success!", res.message, "success");
					updateList();
				} else {
					(alert as any)("Error!", res.message, "error");
				}
			}).catch(err => console.log(err));
	}

	let userComment = false;
	if( userType === "student" && props.comment.studentID == userId ) {
		userComment = true;
	} else if (userType === "teacher" && props.comment.teacherID == userId ) {
		userComment = true;
	}

	return (
		<div className="comment">
			<div className="comment__photo">
				<img src={imgSrc}></img>
			</div>
			<div className="comment__info">
				<div className="comment__info__header">
					<b>{props.comment.firstname + " " + props.comment.lastname}</b>
					<p>{convertDateString(props.comment.commented_on)}</p>
					{userComment
						? <i className="material-icons" onClick={deleteComment}>delete</i>
						: null
					}

				</div>
				<div className="comment__info__comment">
					<p>{props.comment.comment}</p>
				</div>
			</div>
		</div>
	);
}

/* Handles adding new comment to the post */
const CommentForm = () => {
	const { updateList, postCommentUrl } = useContext(CommentsContext);

	const [comment, setComment] = useState("");

	const handleChange = (event: React.ChangeEvent) => {
		event.preventDefault();
		const { value } = (event.target as any);
		if (value === "") {
			(alert as any)("Error!", "You cannot have empty comment", "error");
		}
		setComment(value);
	}

	const onSubmit = (event: React.FormEvent) => {
		event.preventDefault();

		if (comment === "") {
			(alert as any)("Error!", "Cannot have empty comment!", "error");
			return;
		}

		const bearer = "Bearer " + sessionStorage.getItem("jwt");
		fetch(postCommentUrl, {
			method: "post",
			headers: {
				'Authorization': bearer,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ comment: comment })
		}).then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					(alert as any)("Success!", res.message, "success");
					updateList();
				} else {
					(alert as any)("Error!", res.message, "error");
				}
			}).catch(err => console.log(err));
	}

	return (
		<form onSubmit={onSubmit} autoComplete="off">
			<input type="text" name="comment" placeholder="Add a new comment" value={comment} onChange={handleChange} />
			<i className="material-icons" onClick={onSubmit}>send</i>
		</form>
	);
}
