const conn = require("../mysqlConnection");
const fs = require("fs");
const { ResponseWrapper } = require("../routes/utils");
const public_dir = `${process.env['HOME']}/Public`;

function removeFile(path) {
	let fileDeleted = false;
	try {
		fs.rmSync(path);
		fileDeleted = true;
	} catch (err) {
		fileDeleted = false;
	}
	return fileDeleted;
}

/* ========= General endpoints about the teacher ============== */
exports.getTeacher = (req, res) => {
	const id = req.params.teacherID;

	conn.query(`SELECT id, firstname, lastname, email, phone, nationality, address FROM teacher WHERE id=?`, [id], (err, result, _fields) => {
		try {
			if (err) throw err;
			if (result.length == 0) {
				res.json(ResponseWrapper("OK", [], "No student with such id"));
			} else {
				res.json(ResponseWrapper("OK", result[0], ""));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", [], err.message));
		}
	});
}

/* TODO: Make this a put request */
exports.postTeacher = (req, res) => {
	const teacherID = req.params.teacherID;
	const { firstname, lastname, email, phone, address } = req.body;

	const sql = "UPDATE teacher SET firstname=?, lastname=?, email=?, phone=?, address=? WHERE id=?";
	const args = [firstname, lastname, email, phone, address, teacherID];
	conn.query(sql, args, (err, result, fields) => {
		try {
			if (err) throw err;
			if (result.affectedRows === 1) {
				res.json(ResponseWrapper("OK", result, "Student updated successfully!"));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}

	});
}

/* Get the events */
exports.getEvents = (req, res) => {
	try {
		const teacherID = req.params.teacherID;
		const sql = `
			SELECT e.id, e.title, e.description, DATE_FORMAT(e.due, '%Y-%m-%d %T') as due, e.classInstanceID
			FROM event as e
			WHERE 
				e.classInstanceID is NULL
				or (e.classInstanceID in 
					(select id from class_instance where teacherID=?)
				)
			ORDER BY due
					`;
		const args = [teacherID];
		conn.query(sql, args, (err, result, fields) => {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		});

	} catch (err) {
		res.json(ResponseWrapper("ERROR", [], err.message));
	}
}

/* Get event images */
exports.getEventImages = (req, res) => {
	try {
		const { eventID } = req.params;
		const sql = `
			SELECT * FROM event_image WHERE eventID=?
					`;
		const args = [eventID];
		conn.query(sql, args, (err, result, fields) => {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		});

	} catch (err) {
		res.json(ResponseWrapper("ERROR", [], err.message));
	}
}

/* Download event image */
exports.downloadEventImage = (req, res) => {
	const { eventID, filename } = req.params;
	try {
		let picturePath = `${public_dir}/events/${eventID}/${filename}`;
		res.download(picturePath);
	} catch (err) {
		res.status(404).end();
	}
}

/* Get the schedule of a teacher */
exports.getSchedule = (req, res) => {
	try {
		const teacherID = req.params.teacherID;
		const sql = `
		SELECT
			dh.id as id,
			dh.start,
			dh.end,
			cr.id as courseInstanceID,
			cr.classInstanceID,
			cr.courseID,
			sd.day as day,
			sd.name as day_name,
			c.name as course_name,
			c.category as course_category
		FROM 
			day_hours as dh,
			course_registration as cr,
			course as c,
			schedule_day as sd
		WHERE 
			cr.teacherID=?
			and c.id=cr.courseID
			and dh.courseInstanceID=cr.id
			and dh.dayID=sd.id
		ORDER BY sd.day;
		`;
		conn.query(sql, [teacherID], (err, result, fields) => {
			try {
				if (err) throw err;
				res.json(ResponseWrapper("OK", result, ""));
			} catch (err) {
				res.json(ResponseWrapper("ERROR", null, err.message));
			}
		});
	} catch (err) {
		res.json(ResponseWrapper("ERROR", null, err.message));
	}
}

/* Middleware for setting some user information */
exports.setTypeAndId = (req, res, next) => {
	const teacherID = req.params.teacherID;
	req.user = {
		id: teacherID,
		type: "teacher"
	};
	next();
}
/* Return response after the picture has been uploaded */
exports.postProfilePic = (req, res) => {
	if (!req.uploadFailed) {
		res.json(ResponseWrapper("OK", null, "The profile picture uploaded successfully!"));
	} else {
		res.json(ResponseWrapper("ERROR", null, req.uploadMessage));
	}
}

/* Download the teacher's profile picture */
exports.downloadProfilePic = (req, res) => {
	const teacherID = req.params.teacherID;
	const picturesDir = `${public_dir}/profile-pics`;

	try {
		/* Read all the pictures in the directory */
		const files = fs.readdirSync(picturesDir);
		/* Set the path of the picture that we want to null */
		let picturePath = null;
		let defaultPicturePath = `${picturesDir}/default.png`;
		/* Loop throught the files to find a picture for our teacherID */
		files.forEach(file => {
			if (file.includes(`${teacherID}-teacher`)) {
				picturePath = `${public_dir}/profile-pics/${file}`;
			}
		});

		if (picturePath) {
			res.download(picturePath);
		} else {
			res.download(defaultPicturePath);
		}
	} catch (err) {
		res.status(404).end();
	}
}

/* =================== Courses =============================== */
exports.getCourses = (req, res) => {
	const teacherID = req.params.teacherID;
	conn.query(`
		SELECT cr.id, c.category, c.name, cr.classInstanceID as classInstanceID, c.id as courseID
		FROM course as c, course_registration as cr
		WHERE c.id=cr.courseID and cr.teacherID=?
		`,
		[teacherID],
		(err, result, fields) => {
			try {
				if (err) throw err;
				res.json(ResponseWrapper("OK", result, ""));
			} catch (err) {
				res.json(ResponseWrapper("ERROR", [], err.message));
			}
		});
}

exports.getClassCourses = (req, res) => {
	const teacherID = req.params.teacherID;
	conn.query(`
		SELECT cr.id, c.name, c.category, t.firstname, t.lastname
		FROM 
      class_instance as ci,
      course_registration as cr,
      course as c,
      teacher as t
		WHERE 
			ci.teacherID=${teacherID}
      and t.id=cr.teacherID
			and cr.classInstanceId=ci.id
			and cr.courseID=c.id`,
		(err, result, fields) => {
			try {
				if (err) throw err;
				res.json(ResponseWrapper("OK", result, ""));
			} catch (err) {
				res.json(ResponseWrapper("ERROR", [], err.message));
			}
		});
}

/* Get the information about a course instance */
exports.getCourse = (req, res) => {
	const id = req.params.courseInstanceID;

	const sql = `
			SELECT cr.id, c.id as courseID, cr.classInstanceID, c.name, c.category 
			FROM course as c, course_registration as cr 
			WHERE cr.id=? and c.id=cr.courseID`;

	conn.query(sql, [id], (err, result, _fields) => {
		try {
			if (err) throw err;
			if (result.length == 0)
				res.json(ResponseWrapper("ERROR", null, "No courses with such id"));
			else
				res.json(ResponseWrapper("OK", result[0], ""));
		} catch (error) {
			res.json(ResponseWrapper("ERROR", [], err.message));
		}
	});
}

/* Get the students of a course */
exports.getCourseStudents = (req, res) => {
	const courseInstanceID = req.params.courseInstanceID;
	conn.query(`
			SELECT s.id, s.firstname, s.lastname
			FROM student as s, course_registration as cr, class_instance as ci
			WHERE cr.id = ? and ci.id=s.classInstanceID and cr.classInstanceID=ci.id
			ORDER BY s.firstname, s.lastname
		`,
		[courseInstanceID],
		(err, result, fields) => {
			try {
				if (err) throw err;
				res.json(ResponseWrapper("OK", result, ""));
			} catch (err) {
				res.json(ResponseWrapper("ERROR", [], err.message));
			}
		});
}

/* Get the number of hours per week of a particular course */
exports.getCourseHoursPerWeek = (req, res) => {
	const courseInstanceID = req.params.courseInstanceID;

	const sql = `
			SELECT start, end
			FROM day_hours
			WHERE courseInstanceID=?`;

	conn.query(sql, [courseInstanceID], (err, result, _fields) => {
		try {
			if (err) throw err;

			/* Initialize the sum with 0 */
			let sum = 0;

			/* Loop through each hour */
			for (let i = 0; i < result.length; i++) {

				/* Do array destructuring to seperate 
				 *  s_h (start hour)
				 *  s_m (start minute)
				 *  e_h (end hour)
				 *  e_m (end minute)
				 * for each hour
				 * */
				const [s_h, s_m] = result[i].start.split(":");
				const [e_h, e_m] = result[i].end.split(":");

				/* Calculate the minutes between the start and end times */
				const interval_length = (parseInt(e_h) - parseInt(s_h)) * 60
					+ (parseInt(e_m) - parseInt(s_m));

				/* Add it up to the original sum */
				sum += interval_length;
			}

			/* Turn the minutes into hours */
			sum = sum / 60;
			/* Notice how we set the float number fixed to 2 decimal places */
			res.json(ResponseWrapper("OK", sum.toFixed(2), ""));
		} catch (error) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

/* ==> Posts */
/* Get the list of posts in a course */
exports.getCoursePosts = (req, res) => {
	try {
		const courseID = req.params.courseInstanceID;

		const teachersSql = `
			SELECT 
				p.id,
				p.title,
				pb.body,
				t.firstname,
				t.lastname,
				p.teacherID,
				p.studentID,
				p.posted_on
			FROM post as p, post_body as pb, teacher as t
			WHERE pb.postID=p.id and p.courseInstanceID=? and p.teacherID=t.id`;
		const studentsSql = `
			SELECT 
				p.id,
				p.title,
				pb.body,
				s.firstname,
				s.lastname,
				p.teacherID,
				p.studentID,
				p.posted_on
			FROM post as p, post_body as pb, student as s
			WHERE pb.postID=p.id and p.courseInstanceID=? and p.studentID=s.id`;

		const unionSql = `${teachersSql} UNION ${studentsSql} ORDER BY id DESC`;
		conn.query(unionSql,
			[courseID, courseID],
			(err, result, fields) => {
				try {
					if (err) throw err;
					res.json(ResponseWrapper("OK", result, ""));
				} catch (err) {
					res.json(ResponseWrapper("ERROR", [], err.message));
				}
			});
	} catch (err) {
		res.json(ResponseWrapper("ERROR", null, err.message));
	}
}

/* This is a middleware, it uses the teacher id that is included with the post
 * submission to find out the firstname and lastname of that teacher */

/* This is also a middleware, it inserts the entry into the post table */
exports.insertCoursePost = (req, res, next) => {
	const { courseInstanceID, teacherID } = req.params;
	/* These are specified in the request body */
	const title = req.body.title;

	const sql = `INSERT INTO post(title, teacherID, posted_on, courseInstanceID)
					 VALUE(?, ?, NOW(), ?)`;
	conn.query(sql, [title, teacherID, courseInstanceID], (err, result, fields) => {
		try {
			if (err) throw err;
			if (result.affectedRows === 1) {
				req.postID = result.insertId;
				next();
			} else {
				res.json(ResponseWrapper("ERROR", result, "Something went wrong!"));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

/* This is the last step of inserting a post in the database, it inserts the
 * post body into the post_body table */
exports.insertCoursePostBody = (req, res) => {
	/* PostId has been set by the previous middleware */
	const postID = req.postID;
	const body = req.body.body;
	const sql = `INSERT INTO post_body(body, postID) value(?, ?)`;
	conn.query(sql, [body, postID], (err, result, fields) => {
		try {
			if (err) throw err;

			if (result.affectedRows === 1) {
				res.json(ResponseWrapper("OK", result, "Post added successfully!"));
			} else {
				res.json(ResponseWrapper("ERROR", null, "There was an error with processing the post body"));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

/* Update a course post */
exports.updatePost = (req, res) => {
	const { postID } = req.params;
	const { title, body } = req.body;
	const sql = `
    UPDATE post, post_body 
    SET post.title=?, post_body.body=?
    WHERE post.id=post_body.postID and post.id=?
  `;
	conn.query(sql, [title, body, postID], (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", null, "Post updated!"));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

/* Delete a course post */
exports.deletePost = (req, res) => {
	const { postID } = req.params;
	const sql = "DELETE FROM post WHERE id=?";
	conn.query(sql, [postID], (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", null, "Post deleted!"));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

/* ==> Assignments */
/* Get all the assignments of a course */
exports.getCourseAssignments = (req, res) => {
	const courseInstanceID = req.params.courseInstanceID;

	try {
		const sql = `SELECT id, title, description, courseInstanceID, due
			from assignment where courseInstanceID=? ORDER BY due DESC`;

		const args = [courseInstanceID];
		conn.query(sql, args, (err, result, fields) => {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		});
	} catch (err) {
		res.json(ResponseWrapper("ERROR", [], err.message));
	}
}

/* Get the information about an assignment */
exports.getCourseAssignment = (req, res) => {
	const assignmentID = req.params.assignmentID;

	try {
		const sql = `SELECT id, title, description, courseInstanceID, due
			from assignment where id=?`;

		const args = [assignmentID];
		conn.query(sql, args, (err, result, fields) => {
			if (err) throw err;
			if (result.length == 1) {
				res.json(ResponseWrapper("OK", result[0], ""));
			} else {
				res.json(ResponseWrapper("OK", null, ""));
			}
		});
	} catch (err) {
		res.json(ResponseWrapper("ERROR", [], err.message));
	}
}

/* Add a new course assignment */
exports.postCourseAssignment = (req, res) => {
	const courseInstanceID = req.params.courseInstanceID;
	const { title, description, due } = req.body;

	const sql = `INSERT INTO assignment(title, description, courseInstanceID, due)
		VALUE(?, ?, ?, ?)`;
	const args = [title, description, courseInstanceID, due];

	conn.query(sql, args, (err, result, fields) => {
		try {
			if (err) throw err;
			if (result.affectedRows === 1) {
				res.json(ResponseWrapper("OK", result, "Added successfully!"));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

/* Modify a course assignment */
exports.putCourseAssignment = (req, res) => {
	try {
		const assignmentID = req.params.assignmentID;
		const { title, description, due } = req.body;

		const sql = `UPDATE assignment SET title=?, description=?, due=? WHERE id=?`;
		const args = [title, description, due, assignmentID];

		conn.query(sql, args, (err, result, fields) => {
			try {
				if (err) throw err;
				if (result.affectedRows === 1) {
					res.json(ResponseWrapper("OK", result, "Assignment updated!"));
				}
			} catch (err) {
				res.json(ResponseWrapper("ERROR", null, err.message));
			}
		});
	} catch (err) {
		res.json(ResponseWrapper("ERROR", null, err.message));
	}
}

/* Delete an assignment, the middleware to get the classInstanceID of a course
 * is also used, so the below middlewares have a req.classInstanceID*/
exports.deleteAssignmentFiles = (req, res, next) => {
	const classInstanceID = req.classInstanceID;
	const { assignmentID, courseInstanceID } = req.params;
	const sql = "SELECT * FROM shared_file WHERE assignmentID=?";
	conn.query(sql, [assignmentID], (err, result, fields) => {
		try {
			if (err) throw err;
			for (let i = 0; i < result.length; i++) {
				removeFile(`${public_dir}/${classInstanceID}/${courseInstanceID}/shared/${result[i].filename}`);
			}
			next();
		} catch (err) {
			res.json(ResponseWrapper("OK", null, err.message));
		}
	});
}
exports.deleteAssignmentStudentFiles = (req, res, next) => {
	const classInstanceID = req.classInstanceID;
	const { assignmentID, courseInstanceID } = req.params;
	const sql = "SELECT * FROM student_file WHERE assignmentID=?";
	conn.query(sql, [assignmentID], (err, result, fields) => {
		try {
			if (err) throw err;
			for (let i = 0; i < result.length; i++) {
				removeFile(`${public_dir}/${classInstanceID}/${courseInstanceID}/${result[i].studentID}/${result[i].filename}`);
			}
			next();
		} catch (err) {
			res.json(ResponseWrapper("OK", null, err.message));
		}
	});
}
exports.deleteCourseAssignment = (req, res) => {
	try {
		const assignmentID = req.params.assignmentID;

		const sql = `DELETE FROM assignment WHERE id=?`;

		conn.query(sql, [assignmentID], (err, result, fields) => {
			try {
				if (err) throw err;
				if (result.affectedRows === 1) {
					res.json(ResponseWrapper("OK", result, "Assignment deleted!"));
				}
			} catch (err) {
				res.json(ResponseWrapper("ERROR", null, err.message));
			}
		});
	} catch (err) {
		res.json(ResponseWrapper("ERROR", null, err.message));
	}
}

/* Get the list of files an assignment contains */
exports.getAssignmentFiles = (req, res) => {
	const assignmentID = req.params.assignmentID;
	const courseInstanceID = req.params.courseInstanceID;
	try {
		const sql = `
			SELECT sf.id, sf.filename, sf.courseInstanceID, cr.classInstanceID 
			FROM shared_file as sf, course_registration as cr
			WHERE courseInstanceID=? and sf.courseInstanceID=cr.id and assignmentID=?
			ORDER BY sf.id DESC
		`;
		const args = [courseInstanceID, assignmentID];

		conn.query(sql, args, (err, result, fields) => {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		});
	} catch (err) {
		res.json(ResponseWrapper("ERROR", [], err.message));
	}
}

/* Upload a new assignment file, the getCourseClassInstanceId middleware is
 * needed to get the class id of a course */
exports.getCourseClassInstanceId = (req, res, next) => {
	const courseInstanceID = req.params.courseInstanceID;

	try {
		const sql = "SELECT * FROM course_registration WHERE id=?";
		const args = [courseInstanceID];
		conn.query(sql, args, (err, result, fields) => {

			if (err) throw err;
			if (result.length === 1) {
				req.classInstanceID = result[0]['classInstanceID'];
				next();
			} else {
				res.json(ResponseWrapper("ERROR", [], "No such course!"));
			}
		});
	} catch (err) {
		res.json(ResponseWrapper("ERROR", [], err.message));
	}
}
/* Insert the assignment file entry in the database table */
exports.postAssignmentFile = (req, res) => {
	const { courseInstanceID } = req.params;
	const { assignmentID } = req.body;

	try {
		const sql = "INSERT INTO shared_file(filename, courseInstanceID, assignmentID) value(?, ?, ?)";
		const args = [req.file.storedName, courseInstanceID, assignmentID];
		conn.query(sql, args, (err, result, fields) => {

			if (err) throw err;
			if (result.affectedRows === 1) {
				res.json(ResponseWrapper("OK", [], "File uploaded successfully"));
			} else {
				res.json(ResponseWrapper("ERROR", [], "File upload failed!"));
			}

		});
	} catch (err) {
		res.json(ResponseWrapper("ERROR", [], err.message));
	}
}

/* Insert a general course file entry to the database */
exports.postCourseFile = (req, res) => {
	const { courseInstanceID } = req.params;

	try {
		const sql = "INSERT INTO shared_file(filename, courseInstanceID) value(?, ?)";
		const args = [req.file.storedName, courseInstanceID];
		conn.query(sql, args, (err, result, fields) => {

			if (err) throw err;
			if (result.affectedRows === 1) {
				res.json(ResponseWrapper("OK", [], "File uploaded successfully"));
			} else {
				res.json(ResponseWrapper("ERROR", [], "File upload failed!"));
			}

		});
	} catch (err) {
		res.json(ResponseWrapper("ERROR", [], err.message));
	}
}

/* Download a file of the student */
exports.downloadStudentFile = (req, res) => {
	const classInstanceID = req.classInstanceID;

	const filename = req.params.filename;
	const studentID = req.params.studentID;
	const courseInstanceID = req.params.courseInstanceID;
	try {
		res.download(`${public_dir}/${classInstanceID}/${courseInstanceID}/${studentID}/${filename}`);
	} catch (err) {
		res.json(ResponseWrapper("ERROR", [], "Sorry this file does not exist!"));
	}
}

/* Download a file of the assignment */
exports.downloadCourseFile = (req, res) => {
	const classInstanceID = req.classInstanceID;

	const filename = req.params.filename;
	const courseInstanceID = req.params.courseInstanceID;

	try {
		res.download(`${public_dir}/${classInstanceID}/${courseInstanceID}/shared/${filename}`);
	} catch (err) {
		res.json(ResponseWrapper("ERROR", [], err.message));
	}
}

/* Get the files uploaded by the students in an assignment */
exports.getAssignmentStudentFiles = (req, res) => {
	const assignmentID = req.params.assignmentID;
	const courseInstanceID = req.params.courseInstanceID;
	conn.query(`
			SELECT 
				s.id as studentID,
				s.classInstanceID as classInstanceID,
				s.firstname,
				s.lastname,
				sf.filename,
				sf.id,
        sf.posted_on,
        sf.assignmentID,
				sf.courseInstanceID
			FROM student as s, student_file as sf
			WHERE sf.courseInstanceID = ? and sf.studentID=s.id and sf.assignmentID=?
			ORDER BY s.firstname, s.lastname, sf.id DESC;
		`,
		[courseInstanceID, assignmentID],
		(err, result, fields) => {
			try {
				if (err) throw err;
				res.json(ResponseWrapper("OK", result, ""));
			} catch (err) {
				res.json(ResponseWrapper("ERROR", [], err.message));
			}
		});
}

/* ==> Attendance  */
/* Get all the sessions done so far for this course */
exports.getCourseAttendanceSessions = (req, res) => {

	const courseInstanceID = req.params.courseInstanceID;
	conn.query(`
		SELECT
			se.id,
			se.topic as topic,
			se.type as type,
			se.date,
			se.length as total,
			se.week as week
		FROM course_registration as cr, session as se
		WHERE 
			se.courseInstanceID=cr.id
			and cr.id=?
		`,
		[courseInstanceID],
		(err, result, fields) => {
			try {
				if (err) throw err;
				res.json(ResponseWrapper("OK", result, ""));
			} catch (err) {
				res.json(ResponseWrapper("ERROR", [], err.message));
			}
		});
}

/* Get the information about a session */
exports.getCourseAttendanceSession = (req, res) => {
	const sessionID = req.params.sessionID;
	conn.query(`
		SELECT 
			s.id,
			s.firstname,
			s.lastname,
			sa.length as attended,
			se.length as total
		FROM session as se, session_attendance as sa, student as s
		WHERE 
			se.id=?
			and sa.sessionID=se.id
			and s.id=sa.studentID
		`,
		[sessionID],
		(err, result, fields) => {
			try {
				if (err) throw err;
				res.json(ResponseWrapper("OK", result, ""));
			} catch (err) {
				res.json(ResponseWrapper("ERROR", [], err.message));
			}
		}
	);
}

/* Create a new session */
exports.postCourseAttendanceSession = (req, res) => {

	const courseId = req.params.courseInstanceID;

	const week = req.body.week;
	const topic = req.body.topic;
	const type = req.body.type;
	const length = req.body.length;
	const date = req.body.date;

	conn.query(`
		INSERT INTO session(week, topic, type, length, courseInstanceID, date) 
		VALUE (?, ?, ?, ?, ?, ?)`,
		[week, topic, type, length, courseId, date],
		(err, result, fields) => {
			try {
				if (err) throw err;
				res.json(ResponseWrapper("OK", result, ""));
			} catch (err) {
				res.json(ResponseWrapper("ERROR", [], err.message));
			}
		}
	);
}

/* Delete a session, this also deletes all the session data */
exports.deleteCourseAttendanceSession = (req, res) => {
	const sessionID = req.params.sessionID;
	const sql = "DELETE FROM session WHERE id=?";
	conn.query(sql, [sessionID], (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, "Session deleted"));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

/* Insert some attendance data into an existing session */
exports.postCourseSessionInfo = (req, res) => {
	const courseID = conn.escape(req.params.courseInstanceID);
	const sessionID = conn.escape(req.params.sessionID);

	const studentList = req.body;

	let sql = "INSERT INTO session_attendance(length, studentID, sessionID) values";

	for (let i = 0; i < studentList.length; i++) {
		const length = conn.escape(studentList[i].length);
		const studentId = conn.escape(studentList[i].id);

		sql += ` (${length}, ${studentId}, ${sessionID})`;
		if (i < studentList.length - 1) sql += ",";
	}
	conn.query(sql, (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", [], err.message));
		}
	});
}

/* Update the session attendance for a particular student */
exports.updateCourseSessionStudent = (req, res) => {
	const sessionID = req.params.sessionID;
	const studentID = req.params.studentID;
	const new_length = req.body.length;

	conn.query(`
		UPDATE session_attendance
		SET length = ?
		WHERE sessionID=? and studentID=?
		`,
		[new_length, sessionID, studentID],
		(err, result, fields) => {
			try {
				if (err) throw err;
				res.json(ResponseWrapper("OK", [], "Attendance updated"));
			} catch (err) {
				res.json(ResponseWrapper("ERROR", [], err.message));
			}
		});
}

/* ==> Grades */
/* Get all the grades put in this course */
exports.getCourseGrades = (req, res) => {
	const courseInstanceID = req.params.courseInstanceID;
	conn.query(`
			SELECT 
				g.id,
				cr.id as courseID,
				s.id as studentID,
				s.firstname,
				s.lastname,
				g.grade,
				g.comment,
				c.name,
				c.category,
				DATE_FORMAT(g.date, '%Y-%m-%d') as date
			FROM 
				course_registration as cr,
				grade as g,
				student as s,
				course as c
			WHERE 
				cr.id=?
				and g.courseInstanceID=cr.id
				and g.studentID=s.id
				and c.id=cr.courseID
			ORDER BY s.firstname, s.lastname, s.id;
			`,
		[courseInstanceID],
		(err, result, fields) => {
			try {
				if (err) throw err;
				res.json(ResponseWrapper("OK", result, ""));
			} catch (error) {
				res.json(ResponseWrapper("ERROR", [], err.message));
			}
		});
}

/* Add a new array of grades, which could be the result of a test */
exports.postCourseGrades = (req, res) => {

	const courseInstanceID = req.params.courseInstanceID;

	const comment = conn.escape(req.body.comment);
	const date = conn.escape(req.body.date);
	const students = req.body.students;

	let sql = "INSERT INTO grade(comment, date, grade, studentID, courseInstanceID) VALUES";
	/* Loog through each user to create an entry for each one of them in the insert
	 * statement */
	for (let i = 0; i < students.length; i++) {
		const grade = conn.escape(students[i].grade);
		const studentId = conn.escape(students[i].id);

		sql += ` (${comment}, ${date}, ${grade}, ${studentId}, ${courseInstanceID})`;
		if (i < students.length - 1) {
			sql += ",";
		}
	}

	conn.query(sql, (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, "Grades added successfully"));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", [], err.message));
		}
	});
}

/* Delete an array of grades, the deletion is done by the date, so all the
 * grades that were taken on that date, for that particular course would get
 * deleted */
exports.deleteCourseGrades = (req, res) => {
	const { date, classInstanceID } = req.body;
	const sql = `
    DELETE FROM grade
    WHERE date=? 
          and studentID in (
            SELECT id as studentID FROM student 
            WHERE classInstanceID=?
          )
  `;
	conn.query(sql, [date, classInstanceID], (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, "Grades deleted successfully"));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", [], err.message));
		}
	});
}

/* Update an already existing grade */
exports.putCourseGrade = (req, res) => {
	const gradeID = req.params.gradeID;
	const { grade, comment, date } = req.body;
	const sql = "UPDATE grade SET grade=?, comment=?, date=? WHERE id=?";
	conn.query(sql, [grade, comment, date, gradeID], (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, "Grade updated successfully"));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", [], err.message));
		}
	});
}

/* Delete a single grade */
exports.deleteCourseGrade = (req, res) => {
	const gradeID = req.params.gradeID;
	const sql = "DELETE FROM grade WHERE id=?";
	conn.query(sql, [gradeID], (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, "Grade deleted successfully"));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", [], err.message));
		}
	});
}

/* ==> Course files */
/* Get a list of the general course files for this course */
exports.getCourseFiles = (req, res) => {
	const courseInstanceID = req.params.courseInstanceID;
	try {
		const sql = `
			SELECT sf.id, sf.filename, sf.courseInstanceID, cr.classInstanceID 
			FROM shared_file as sf, course_registration as cr
			WHERE courseInstanceID=? and sf.courseInstanceID=cr.id and sf.assignmentID is null
			ORDER BY sf.id DESC
		`;
		const args = [courseInstanceID];

		conn.query(sql, args, (err, result, fields) => {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		});
	} catch (err) {
		res.json(ResponseWrapper("ERROR", [], err.message));
	}
}

/* Delete a course file, this function also need a req.classInstanceID to be
 * set by a previous middleware, that middleware is 'getCourseClassInstanceID' */
exports.deleteCourseFile = (req, res, next) => {
	const classInstanceID = req.classInstanceID;
	const { fileID, courseInstanceID } = req.params;
	const sql = "SELECT * FROM shared_file WHERE id=?";
	conn.query(sql, [fileID], (err, result, fields) => {
		try {
			if (err) throw err;
			if (result.length === 1) {
				removeFile(`${public_dir}/${classInstanceID}/${courseInstanceID}/shared/${result[0].filename}`);
			}
			next();
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}
/* Delete the course file entry from the database table */
exports.deleteCourseFileEntry = (req, res) => {
	const { fileID } = req.params;
	const sql = "DELETE FROM shared_file WHERE id=?";
	conn.query(sql, [fileID], (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", null, "File deleted!"));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

/* ==> Course register */
/* Get all the marks for a student */
exports.getStudentMarks = (req, res) => {
	const studentID = req.params.studentID;
	const { month, year, courseInstanceID } = req.query;
	const date = `${year}-${month}-%`;
	const sql = `
        SELECT id, mark, comment, DATE_FORMAT(date, '%Y-%m-%d') as date, studentID, courseInstanceID
        FROM register 
        WHERE studentID=? and courseInstanceID=? and MONTH(date)=${month} and YEAR(date)=${year}`;
	conn.query(sql, [studentID, courseInstanceID, date], (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
		}
	});
}

/* Add a new mark for a student */
exports.postStudentMark = (req, res) => {
	const { studentID } = req.params;
	const { mark, comment, date, courseInstanceID } = req.body;

	const sql = `
        INSERT INTO register(mark, comment, date, studentID, courseInstanceID)
        VALUE(?, ?, ?, ?, ?)
    `;


	const args = [mark, comment, date, studentID, courseInstanceID];

	conn.query(sql, args, (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, "Student mark added successfully"));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});

}

/* Update an already existing student mark */
exports.putStudentMark = (req, res) => {
	const { markID } = req.params;
	const { mark, comment } = req.body;

	const sql = `
        UPDATE register SET mark=?, comment=? WHERE id=?
    `;


	const args = [mark, comment, markID];

	conn.query(sql, args, (err, result, fields) => {
		try {
			if (err) throw err;
			if (result.affectedRows === 1) {
				res.json(ResponseWrapper("OK", null, "Student mark updated successfully"));
			} else {
				res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});

}

/* Delete a student mark */
exports.deleteStudentMark = (req, res) => {
	const { markID } = req.params;

	const sql = `
        DELETE FROM register WHERE id=?
    `;

	conn.query(sql, [markID], (err, result, fields) => {
		try {
			if (err) throw err;
			if (result.affectedRows === 1) {
				res.json(ResponseWrapper("OK", null, "Student mark deleted successfully"));
			} else {
				res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

/* ============== Post comments endpoints ===================== */
/* Get all the comments of a post */
exports.getComments = (req, res) => {
	try {
		const { postID } = req.params;
		/* We need to get the comments from both the teachers and the students
		 * So to be able to do this with a single query, we use the 'union'
		 * operation to concatenate two result sets */
		const teacherCommentsSql = `
      SELECT 
        pc.id,
        pc.comment,
        pc.postID,
        pc.commented_on,
        pc.teacherID,
        pc.studentID,
        t.firstname,
        t.lastname
      FROM post_comment as pc, teacher as t
      WHERE postID=? and pc.teacherID=t.id
    `;
		const studentCommentsSql = `
      SELECT 
        pc.id,
        pc.comment,
        pc.postID,
        pc.commented_on,
        pc.teacherID,
        pc.studentID,
        s.firstname,
        s.lastname
      FROM post_comment as pc, student as s
      WHERE postID=? and pc.studentID=s.id
    `;
		/* Now we join these results */
		const sql = `${teacherCommentsSql} UNION ${studentCommentsSql} ORDER BY commented_on`;
		const args = [postID, postID];

		conn.query(sql, args, (err, result, fields) => {
			try {
				if (err) throw err;
				res.json(ResponseWrapper("OK", result, ""));
			} catch (err) {
				res.json(ResponseWrapper("ERROR", null, err.message));
			}
		});

	} catch (error) {
		res.json(ResponseWrapper("ERROR", null, error.message));
	}
}

/* Create a new comment for a specific post */
exports.postComment = (req, res) => {
	try {
		const { teacherID, postID } = req.params;
		const { comment } = req.body;

		const sql = `INSERT INTO post_comment(comment, teacherID, postID, commented_on) VALUE(?, ?, ?, NOW())`;
		const args = [comment, teacherID, postID];

		conn.query(sql, args, (err, result, fields) => {
			try {
				if (err) throw err;
				res.json(ResponseWrapper("OK", result, "Comment added!"));
			} catch (err) {
				res.json(ResponseWrapper("ERROR", null, err.message));
			}
		});

	} catch (error) {
		res.json(ResponseWrapper("ERROR", null, error.message));
	}
}

/* Delete a comment */
exports.deleteComment = (req, res) => {
	try {
		const { commentID } = req.params;

		const sql = `DELETE FROM post_comment WHERE id=?`;
		const args = [commentID];

		conn.query(sql, args, (err, result, fields) => {
			try {
				if (err) throw err;
				if (result.affectedRows === 1) {
					res.json(ResponseWrapper("OK", null, "Comment deleted!"));
				} else {
					res.json(ResponseWrapper("OK", null, "Could not find the comment!"));
				}
			} catch (err) {
				res.json(ResponseWrapper("ERROR", null, err.message));
			}
		});

	} catch (error) {
		res.json(ResponseWrapper("ERROR", null, error.message));
	}
}

/* Modify a comment */
exports.verifyTeacherComment = (req, res, next) => {
	try {
		const { commentID, teacherID } = req.params;

		const sql = `SELECT * FROM post_comment WHERE id=?`;
		const args = [commentID];

		conn.query(sql, args, (err, result, fields) => {
			try {
				if (err) throw err;
				if (result.length === 1) {
					const comment = result[0];
					if (comment['teacherID'] == teacherID) {
						next();
					} else {
						res.json(ResponseWrapper("ERROR", null, "You can only modify your comments!"));
					}
				} else {
					res.json(ResponseWrapper("ERROR", null, "Comment does not exist!"));
				}
			} catch (err) {
				res.json(ResponseWrapper("ERROR", null, err.message));
			}
		});

	} catch (error) {
		res.json(ResponseWrapper("ERROR", null, error.message));
	}
}
exports.putComment = (req, res) => {
	try {
		const { commentID } = req.params;
		const { comment } = req.body;

		const sql = `UPDATE post_comment SET comment=? WHERE id=?`;
		const args = [comment, commentID];

		conn.query(sql, args, (err, result, fields) => {
			try {
				if (err) throw err;
				if (result.affectedRows === 1) {
					res.json(ResponseWrapper("OK", null, "Comment updated!"));
				} else {
					res.json(ResponseWrapper("OK", null, "Could not find the comment!"));
				}
			} catch (err) {
				res.json(ResponseWrapper("ERROR", null, err.message));
			}
		});

	} catch (error) {
		res.json(ResponseWrapper("ERROR", null, error.message));
	}
}

/* ================= Get min and max grade ===================== */
exports.getGradeLimits = (req, res) => {
	try {
		const sql = `SELECT * FROM config WHERE \`key\`='minGrade' OR \`key\`='maxGrade'`;
		const args = [];
		conn.query(sql, args, (err, result, fields) => {
			console.log(result);
			try {
				if (err) throw err;
				console.log(result);
				if (result.length != 2) throw 'Could not find those two config items';
				const response = {
					[result[0].key]: parseInt(result[0].value),
					[result[1].key]: parseInt(result[1].value),
				};
				res.json(ResponseWrapper("OK", response, ""));
			} catch (e) {
				/* handle error */
				res.json(ResponseWrapper("ERROR", result, e.message));
			}
		});
	} catch (e) {
		/* handle error */
		res.json(ResponseWrapper("ERROR", null, e.message));
	}
}
