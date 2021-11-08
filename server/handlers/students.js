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

/*=============== Information about a student ==========================*/
/* Get information about a student */
exports.getStudent = (req, res) => {
	const id = req.params.studentID;

	conn.query(`SELECT * FROM student WHERE id=?`, [id], (err, result, _fields) => {
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

/* Update a student */
exports.putStudent = (req, res) => {
	const studentID = req.params.studentID;
	const { firstname, lastname, email, phone, address } = req.body;

	const sql = "UPDATE student SET firstname=?, lastname=?, email=?, phone=?, address=? WHERE id=?";
	const args = [firstname, lastname, email, phone, address, studentID];
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

/* Get a list of all grades on all the courses taken by a student */
exports.getAllGrades = (req, res) => {
	const id = req.params.studentID;
	const sql = `
		SELECT 
			g.id as id,
			c.name,
			g.grade,
			g.comment,
			cr.id as courseID,
			DATE_FORMAT(g.date, '%Y-%m-%d') as date
		FROM grade as g, course as c, course_registration as cr
		WHERE 
			g.studentID=?
			and g.courseInstanceID=cr.id
			and cr.courseID=c.id
		ORDER BY c.id ASC
	`;
	conn.query(sql, [id], (err, result, _fields) => {
		try {
			if (err) throw err;
			if (result.length == 0) {
				res.json(ResponseWrapper("OK", [], "No grades"));
			} else {
				res.json(ResponseWrapper("OK", result, ""));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", [], err.message));
		}
	});
}

/* Get a list of all attendance sessions */
exports.getAllAttendanceSessions = (req, res) => {
	const studentID = req.params.studentID;
	const sql = `
			SELECT 
				s.id,
				s.week,
				s.topic,
				s.type,
				s.length,
				DATE_FORMAT(s.date, '%Y-%m-%d') as date,
				sa.length as attended
			FROM session as s, session_attendance as sa
			WHERE sa.sessionID=s.id and sa.studentID=?
			ORDER BY s.date DESC;
		`;
	const args = [studentID];

	conn.query(sql, args, (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", [], err.message));
		}
	});
}

/* Middleware for setting some user information */
exports.setTypeAndId = (req, res, next) => {
	const studentID = req.params.studentID;
	req.user = {
		id: studentID,
		type: "student"
	};
	next();
}
/* Return a response after the picture has been uploaded */
exports.postProfilePic = (req, res) => {
	if (!req.uploadFailed) {
		res.json(ResponseWrapper("OK", null, "The profile picture uploaded successfully!"));
	} else {
		res.json(ResponseWrapper("ERROR", null, req.uploadMessage));
	}
}

/* Download the student's profile picture */
exports.downloadProfilePic = (req, res) => {
	const studentID = req.params.studentID;
	const picturesDir = `${public_dir}/profile-pics`;

	try {
		/* Read all the pictures in the directory */
		const files = fs.readdirSync(picturesDir);
		/* Set the path of the picture that we want to null */
		let picturePath = null;
		let defaultPicturePath = `${picturesDir}/default.png`;
		/* Loop throught the files to find a picture for our studentID */
		files.forEach(file => {
			if (file.includes(`${studentID}-student`)) {
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


/* ==================================================================== */

/* =========================== Events ================================= */
/* Get all the events in the students class */
exports.getEvents = (req, res) => {
	const studentID = req.params.studentID;
	const sql = `
			SELECT e.id, e.title, e.description, DATE_FORMAT(e.due, '%Y-%m-%d %T') as due, e.classInstanceID
			FROM event as e, student as s, class_instance as ci
			WHERE 
				s.id=?
				and s.classInstanceID = ci.id
				and (e.classInstanceID = ci.id or e.classInstanceID IS NULL)
					`;
	const args = [studentID];
	conn.query(sql, args, (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", [], err.message));
		}
	});
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

/* ==================================================================== */

/* =========================== Schedule =============================== */
exports.getSchedule = (req, res) => {

	const id = req.params.studentID;
	const sql = `
		SELECT
			dh.id as id,
      dh.start,
      dh.end,
			cr.classInstanceID as classInstanceID,
			sd.day as day,
			sd.name as day_name,
			c.name as course_name,
			cr.id as courseInstanceID,
			c.category as course_category
		FROM 
			student as st,
			class_instance as ci,
			schedule as s,
			schedule_day as sd,
			day_hours as dh,
			course_registration as cr,
			course as c 
		WHERE 
			st.id=? 
			and st.classInstanceID=ci.id 
			and  ci.scheduleID=s.id 
			and sd.scheduleID=s.id 
			and dh.dayID=sd.id 
			and dh.courseInstanceID=cr.id 
			and cr.courseID=c.id
		ORDER BY sd.day;
	`;
	conn.query(sql, [id], (err, result, _fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", [], err.message));
		}
	});
}

/* ==================================================================== */

/* ============================ Course ================================ */
/* Get a list of all courses for a student */
exports.getCourses = (req, res) => {

	const id = req.params.studentID;
	const sql = `
		SELECT
      c.id as courseID,
      c.name,
      c.category,
      cr.id,
      CONCAT(t.firstname, ' ', t.lastname) as teacher
		FROM 
      course as c,
      course_registration as cr,
      student as s,
      teacher as t
		WHERE 
      cr.classInstanceID=s.classInstanceID 
      and cr.courseID=c.id 
      and cr.teacherID=t.id
      and s.id=?
	`;
	conn.query(sql, [id], (err, result, _fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", [], err.message));
		}
	});
}

/* Get information about a course */
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

/* Get the last grade the student got in this course */
exports.getCourseLastGrade = (req, res) => {
	const { studentID, courseInstanceID } = req.params;
	const sql = `SELECT * FROM grade WHERE studentID=? and courseInstanceID=? ORDER BY date DESC LIMIT 1`;
	conn.query(sql, [studentID, courseInstanceID], (err, result, _fields) => {
		try {
			if (err) throw err;
			if (result.length == 0)
				res.json(ResponseWrapper("OK", null, "No grades so far!"));
			else
				res.json(ResponseWrapper("OK", result[0].grade, ""));
		} catch (error) {
			res.json(ResponseWrapper("ERROR", [], err.message));
		}
	});
}

/* ==> Attendance */
/* Get a list of attendance sessions has been/not been present in */
exports.getCourseAttendance = (req, res) => {
	const studentID = req.params.studentID;
	const courseInstanceID = req.params.courseInstanceID;
	const sql = `
			SELECT 
				s.id,
				s.week,
				s.topic,
				s.type,
				s.length,
				DATE_FORMAT(s.date, '%Y-%m-%d') as date,
				sa.length as attended
			FROM session as s, session_attendance as sa
			WHERE s.courseInstanceID=? and sa.sessionID=s.id and sa.studentID=?
			ORDER BY s.date DESC;
		`;
	const args = [courseInstanceID, studentID];

	conn.query(sql, args, (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", [], err.message));
		}
	});
}

/* ==> Assignments */
/* Get a list of assignments */
exports.getCourseAssignments = (req, res) => {
	const courseInstanceID = req.params.courseInstanceID;

	const sql = `SELECT id, title, description, courseInstanceID,  DATE_FORMAT(due, '%Y-%m-%d %T') as due
			from assignment where courseInstanceID=? ORDER BY due DESC`;

	const args = [courseInstanceID];
	conn.query(sql, args, (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", [], err.message));
		}
	});
}

/* Get information about an assignment */
exports.getCourseAssignment = (req, res) => {
	const assignmentID = req.params.assignmentID;

	const sql = `SELECT id, title, description, courseInstanceID,  DATE_FORMAT(due, '%Y-%m-%d %T') as due
			from assignment where id=?`;

	const args = [assignmentID];
	conn.query(sql, args, (err, result, fields) => {
		try {
			if (err) throw err;
			if (result.length == 1) {
				res.json(ResponseWrapper("OK", result[0], ""));
			} else {
				res.json(ResponseWrapper("OK", null, ""));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", [], err.message));
		}
	});
}

/* Get a list of files for an assignment */
exports.getCourseAssignmentFiles = (req, res) => {
	const courseInstanceID = req.params.courseInstanceID;
	const assignmentID = req.params.assignmentID;
	const sql = `
			SELECT sf.id, sf.filename, sf.courseInstanceID, cr.classInstanceID 
			FROM shared_file as sf, course_registration as cr
			WHERE courseInstanceID=? and sf.courseInstanceID=cr.id and sf.assignmentID=?
			ORDER BY sf.id DESC
		`;
	const args = [courseInstanceID, assignmentID];

	conn.query(sql, args, (err, result, _fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", [], err.message));
		}
	});

}

/* Get the list of files the student has uploaded so far to an assignment */
exports.getStudentFiles = (req, res) => {
	const studentID = req.params.studentID;
	const courseInstanceID = req.params.courseInstanceID;
	const assignmentID = req.params.assignmentID;
	const sql = `
			SELECT 
				s.classInstanceID as classInstanceID,
				sf.id as id,
				sf.filename,
				sf.courseInstanceID,
				sf.studentID
			FROM student_file as sf, student as s
			WHERE 
				sf.courseInstanceID=? 
				and sf.studentID=?
				and sf.studentID=s.id
				and sf.assignmentID=?
			ORDER BY sf.id DESC
		`;
	const args = [courseInstanceID, studentID, assignmentID];

	conn.query(sql, args, (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", [], err.message));
		}
	});
}

/* Upload a file to an assignment, we need a middleware to get the
 * classInstanceID of a course */
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
exports.postStudentFile = (req, res) => {

	const { classInstanceID, studentID, courseInstanceID } = req.params;

	const assignmentID = req.body.assignmentID;

	const sql = `
    INSERT INTO student_file(filename, studentID, courseInstanceID, assignmentID, posted_on) 
    VALUE(?, ?, ?, ?, NOW())`;
	const args = [req.file.storedName, studentID, courseInstanceID, assignmentID];
	conn.query(sql, args, (err, result, fields) => {

		try {
			if (err) throw err;
			if (result.affectedRows === 1) {
				res.json(ResponseWrapper("OK", [], "File uploaded successfully"));
			} else {
				res.json(ResponseWrapper("ERROR", [], "File upload failed!"));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", [], err.message));
		}

	});
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
		res.json(ResponseWrapper("ERROR", [], err.message));
	}
}

/* Delete a file of the student */
exports.deleteStudentFile = (req, res, next) => {
	const classInstanceID = req.classInstanceID;
	const { studentID, fileID, courseInstanceID } = req.params;
	const sql = "SELECT * FROM student_file WHERE id=?";
	conn.query(sql, [fileID], (err, result, fields) => {
		try {
			if (err) throw err;
			if (result.length === 1) {
				removeFile(`${public_dir}/${classInstanceID}/${courseInstanceID}/${studentID}/${result[0].filename}`);
			}
			next();
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}
exports.deleteStudentFileEntry = (req, res) => {
	const { fileID } = req.params;
	const sql = 'DELETE FROM student_file WHERE id=?';
	conn.query(sql, [fileID], (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", null, "File deleted!"));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", [], err.message));
		}
	});
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


/* ==> Posts */
/* Get all the posts for this course */
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

/* Insert a new post, two of these methods are middlewares
 * The api call goes like this:
 * insertCoursePost --> inserCoursePostBody 
 * */
exports.insertCoursePost = (req, res, next) => {
	const { courseInstanceID, studentID } = req.params;

	/* These are specified in the request body */
	const title = req.body.title;

	const sql = `INSERT INTO post(title, studentID, posted_on, courseInstanceID)
					 VALUE(?, ?, NOW(), ?)`;
	conn.query(sql, [title, studentID, courseInstanceID], (err, result, fields) => {
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
        DATE_FORMAT(pc.commented_on, '%Y-%m-%d %T') as commented_on,
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
        DATE_FORMAT(pc.commented_on, '%Y-%m-%d %T') as commented_on,
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
		const { studentID, postID } = req.params;
		const { comment } = req.body;

		const sql = `INSERT INTO post_comment(comment, studentID,  postID, commented_on) VALUE(?, ?, ?, NOW())`;
		const args = [comment, studentID, postID];

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
exports.verifyStudentComment = (req, res, next) => {
	try {
		const { commentID, studentID } = req.params;

		const sql = `SELECT * FROM post_comment WHERE id=?`;
		const args = [commentID];

		conn.query(sql, args, (err, result, fields) => {
			try {
				if (err) throw err;
				if (result.length === 1) {
					const comment = result[0];
					if (comment['studentID'] == studentID) {
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

/* ==> Grades */
/* Get the grades for this course */
exports.getCourseGrades = (req, res) => {

	const id = req.params.studentID;
	const courseID = req.params.courseInstanceID;
	const sql = `
		SELECT 
			g.id as id,
			c.name,
			g.grade,
			g.comment,
			cr.id as courseID,
			DATE_FORMAT(g.date, '%Y-%m-%d') as date
		FROM grade as g, course as c, course_registration as cr
		WHERE 
			g.studentID=?
			and g.courseInstanceID=cr.id
			and cr.courseID=c.id
			and cr.id=?
		ORDER BY c.id ASC
	`;
	conn.query(sql, [id, courseID], (err, result, _fields) => {
		try {
			if (err) throw err;
			if (result.length == 0) {
				res.json(ResponseWrapper("OK", [], "No grades"));
			} else {
				res.json(ResponseWrapper("OK", result, ""));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", [], err.message));
		}
	});
}

/* ==> General files */
/* Get the general files for a course */
exports.getCourseFiles = (req, res) => {

	const courseInstanceID = req.params.courseInstanceID;
	const sql = `
			SELECT sf.id, sf.filename, sf.courseInstanceID, cr.classInstanceID 
			FROM shared_file as sf, course_registration as cr
			WHERE 
				courseInstanceID=? 
				and sf.courseInstanceID=cr.id 
				and sf.assignmentID is NULL
			ORDER BY sf.id DESC
		`;
	const args = [courseInstanceID];

	conn.query(sql, args, (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", [], err.message));
		}
	});

}

/* ==================================================================== */
