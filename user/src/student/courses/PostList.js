import React, { useEffect, useState, useContext } from 'react';
import apiLink from "../../API";
import { CourseContext } from './Course';
import { StudentContext } from '../Student';
import {CommentsContext, Comments} from "../../shared/PostComments";
import { convertDateString } from '../../Utils';

function PostList(props) {
	const course = useContext(CourseContext);
	const studentId = useContext(StudentContext);

	/* This variable is used to determine when we should update the post list.
	 * Typically this is done after we have added a new post. Everytime this
	 * changes the useEffect hook will rerun.*/
	const [shouldUpdate, setShouldUpdate] = useState(0);

	const [posts, setPosts] = useState([]);
	useEffect(() => {

		const fetchPosts = async () => {

			const token = sessionStorage.getItem("jwt");
			const bearer = 'Bearer ' + token;
			await fetch(`${apiLink}/students/${studentId}/courses/${course.id}/posts`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						setPosts(res.result);
					} else {
						alert("Error", res.message, "error");
					}
				});
		}

		fetchPosts();
	}, [shouldUpdate, course.id, studentId]);

	return (
		<div className="post-list">
			<PostForm updateCallback={() => setShouldUpdate(shouldUpdate + 1)} />
			{posts.map(post => <PostItem key={post.id} post={post} />)}
		</div>
	);
}

function PostItem({ post }) {
	const lines = post.body.split("\n");

	let imgLink='';
	if (post.teacherID) {
		imgLink = `${apiLink}/teachers/${post.teacherID}/picture`;
	} else {
		imgLink = `${apiLink}/students/${post.studentID}/picture`;
	}

	return (
		<div className="post-item">
			<div className="header">
				<div className="header__title">
					<img src={imgLink}></img>
					<p><b>{post.firstname + " " + post.lastname}</b></p>
					<p className="datetime">{convertDateString(post.posted_on)}</p>
				</div>
			</div>
			<div className="body">
				<p><b>{post.title}</b></p>
				{lines.map(line => <p>{line}</p>)}
			</div>
      <CommentSection postId={post.id} />
		</div>
	);
}

const CommentSection = ({postId}) => {
	const studentId = useContext(StudentContext);
	const course = useContext(CourseContext);

	const [update, setUpdate] = useState(0);
	const [comments, setComments] = useState([]);
	useEffect(() => {
		/* The jwt token */
		const bearer = "Bearer " + sessionStorage.getItem("jwt");
		/* Perform a get request to the api */
		fetch(`${apiLink}/students/${studentId}/courses/${course.id}/posts/${postId}/comments`, {
			headers: {
				'Authorization': bearer
			}
		}).then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					setComments(res.result);
				} else {
					console.log(res.message);
				}
			}).catch(err => console.log(err));
	}, [studentId, course.id, postId, update]);
	return (
		
		<CommentsContext.Provider
			value={{
				postId: postId,
				updateList: () => setUpdate(update + 1),
				deleteCommentUrl: `${apiLink}/students/${studentId}/courses/${course.id}/posts/${postId}/comments`,
				postCommentUrl: `${apiLink}/students/${studentId}/courses/${course.id}/posts/${postId}/comments`,
				courseId: course.id,
				userId: studentId,
        userType: "student"
			}}
		>
			<Comments postId={postId} comments={comments} />
		</CommentsContext.Provider>
	);
}

function PostForm(props) {
	const updatePostList = props.updateCallback;
	const studentId = useContext(StudentContext);
	const course = useContext(CourseContext);

	const [shown, setShown] = useState(false);

	const [post, setPost] = useState({
		title: "",
		body: ""
	});

	const handleChange = (event) => {
		event.preventDefault();
		const target = event.target;
		const name = target.name;
		const value = target.value;
		if (name === "title") {
			if (value.length > 100) {
        alert("Error", "Title is too long!", "error");
				return;
			}
		}
		setPost({ ...post, [name]: value });
	}

	const onSubmit = async (event) => {
		event.preventDefault();
		const token = sessionStorage.getItem("jwt");
		const bearer = "Bearer " + token;

		const req_body = {
			title: post.title,
			body: post.body
		};

		await fetch(`${apiLink}/students/${studentId}/courses/${course.id}/posts`, {
			method: 'post',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': bearer
			},
			body: JSON.stringify(req_body)
		})
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
          alert("Success!", res.message, "success");
					updatePostList();
					setShown(false);
				} else {
          alert("Error", res.message, "error");
				}
			}).catch(err => console.log(err));
	}

	const cancel = (event) => {
		event.preventDefault();
		setShown(false);
	}
	return (
		<div className="post-form">
			<button onClick={() => setShown(true)} className={shown ? "hidden" : "shown"} >Post</button>
			<form onSubmit={onSubmit} className={shown ? "shown" : "hidden"}>
				<label>
					Title<br/>
					<input type="text" onChange={handleChange} name="title" placeholder="Post title" value={post.title} />
				</label>
				<label>
					Body<br/>
					<textarea onChange={handleChange} name="body" rows="10" cols="30" placeholder="Post body" value={post.body} />
				</label>
				<button type="submit">Add post</button>
				<button onClick={cancel}>Cancel</button>
			</form>
		</div>
	);
}

export default PostList;
