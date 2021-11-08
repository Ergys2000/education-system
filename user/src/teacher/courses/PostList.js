import React, { useEffect, useState, useContext } from 'react';
import apiLink from "../../API";
import { CourseContext } from "./Course";
import { TeacherContext } from "../Teacher";
import { CommentsContext, Comments } from "../../shared/PostComments";
import { convertDateString } from '../../Utils';

/* Displays a list of posts */
function PostList(props) {
	const course = useContext(CourseContext);
	const teacherId = useContext(TeacherContext);

	/* This variable is used to determine when we should update the post list.
	 * Typically this is done after we have added a new post. Everytime this
	 * changes the useEffect hook will rerun.*/
	const [shouldUpdate, setShouldUpdate] = useState(0);

	const [posts, setPosts] = useState([]);
	useEffect(() => {
		const fetchPosts = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = 'Bearer ' + token;

			await fetch(`${apiLink}/teachers/${teacherId}/courses/${course.id}/posts`, {
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
	}, [shouldUpdate, course.id, teacherId]);

	const update = () => setShouldUpdate(shouldUpdate + 1);

	return (
		<div className="post-list">
			<PostForm updateCallback={update} />
			{posts.map(post =>
				<PostItem key={post.id} post={post} updateList={update} />)
			}
		</div>
	);
}

/* Displays a single post */
function PostItem({ post, updateList }) {
	const course = useContext(CourseContext);
	const teacherId = useContext(TeacherContext);
	const [modifyPost, setModifyPost] = useState(false);

	let imgLink='';
	if (post.teacherID) {
		imgLink = `${apiLink}/teachers/${post.teacherID}/picture`;
	} else {
		imgLink = `${apiLink}/students/${post.studentID}/picture`;
	}

	const deletePost = (event) => {
		event.preventDefault();
		const bearer = "Bearer " + sessionStorage.getItem("jwt");
		fetch(`${apiLink}/teachers/${teacherId}/courses/${course.id}/posts/${post.id}`, {
			method: "delete",
			headers: {
				'Authorization': bearer
			}
		}).then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					alert("Success", res.message, "success");
					updateList();
				} else {
					alert("Error", res.message, "error");
				}
			}).catch(err => console.log(err));
	}

	const textLines = post.body.split("\n");

	return (
		<div className="post-item">
			<div className="header">
				<div className="header__title">
					<img src={imgLink}></img>
					<p><b>{post.firstname + " " + post.lastname}</b></p>
					<p className="datetime">{convertDateString(post.posted_on)}</p>
				</div>
				<div className="header__actions">
					<i
						className="material-icons header__actions__edit"
						onClick={() => setModifyPost(true)}
					>edit</i>
					<i
						className="material-icons header__actions__delete"
						onClick={deletePost}
					>delete</i>
				</div>
			</div>
			<div className="body">
				<p><b>{post.title}</b></p>
				{textLines.map(line => <p>{line}</p>)}
			</div>
			<CommentSection postId={post.id} />

			{modifyPost
				? (<ModifyPost
					post={post}
					close={() => setModifyPost(false)}
					updateList={updateList} />
				)
				: null}
		</div>
	);
}

const CommentSection = ({ postId }) => {
	const teacherId = useContext(TeacherContext);
	const course = useContext(CourseContext);

	const [update, setUpdate] = useState(0);
	const [comments, setComments] = useState([]);
	useEffect(() => {
		/* The jwt token */
		const bearer = "Bearer " + sessionStorage.getItem("jwt");
		/* Perform a get request to the api */
		fetch(`${apiLink}/teachers/${teacherId}/courses/${course.id}/posts/${postId}/comments`, {
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
	}, [teacherId, course.id, postId, update]);
	return (

		<CommentsContext.Provider
			value={{
				postId: postId,
				updateList: () => setUpdate(update + 1),
				deleteCommentUrl: `${apiLink}/teachers/${teacherId}/courses/${course.id}/posts/${postId}/comments`,
				postCommentUrl: `${apiLink}/teachers/${teacherId}/courses/${course.id}/posts/${postId}/comments`,
				courseId: course.id,
				userId: teacherId,
				userType: "teacher"
			}}
		>
			<Comments postId={postId} comments={comments} />
		</CommentsContext.Provider>
	);
}

const ModifyPost = (props) => {
	const teacherId = useContext(TeacherContext);
	const course = useContext(CourseContext);
	const [post, setPost] = useState({ ...props.post });

	const onSubmit = (event) => {
		event.preventDefault();
		const token = sessionStorage.getItem("jwt");
		const bearer = "Bearer " + token;

		const req_body = {
			title: post.title,
			body: post.body
		};

		fetch(`${apiLink}/teachers/${teacherId}/courses/${course.id}/posts/${post.id}`, {
			method: 'put',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': bearer
			},
			body: JSON.stringify(req_body)
		})
			.then(res => res.json())
			.then(res => {
				if (res.status === "OK") {
					props.updateList(post);
					alert("Success!", res.message, "success");
				} else {
					alert("Error", res.message, "error");
				}
				props.close();
			}).catch(err => console.log(err));
	};
	const handleChange = (event) => {
		event.preventDefault();
		const { name, value } = event.target;
		setPost({ ...post, [name]: value });
	};
	const cancel = (event) => {
		event.preventDefault();
		props.close();
	};
	return (
		<div className="modify-post">
			<form onSubmit={onSubmit}>
				<label>
					Title<br />
					<input type="text" onChange={handleChange} name="title" placeholder="Post title" value={post.title} />
				</label>
				<label>
					Body<br />
					<textarea onChange={handleChange} name="body" rows="10" cols="30" placeholder="Post body" value={post.body} />
				</label>
				<button type="submit">Modify Post</button>
				<button onClick={cancel}>Cancel</button>
			</form>
		</div>
	);
}

function PostForm(props) {
	const updatePostList = props.updateCallback;
	const teacherId = useContext(TeacherContext);
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
				alert("Error", "The title is too long", "error");
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

		await fetch(`${apiLink}/teachers/${teacherId}/courses/${course.id}/posts`, {
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
					alert("Success", "Post added successfully!", "success");
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
					Title<br />
					<input type="text" onChange={handleChange} name="title" placeholder="Post title" value={post.title} />
				</label>
				<label>
					Body<br />
					<textarea onChange={handleChange} name="body" rows="10" cols="30" placeholder="Post body" value={post.body} />
				</label>
				<button type="submit">Add post</button>
				<button onClick={cancel}>Cancel</button>
			</form>
		</div>
	);
}


export default PostList;
