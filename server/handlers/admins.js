const public_dir = `${process.env['HOME']}/Public`;
const multer = require("multer");
const fs = require("fs");

const { ResponseWrapper } = require("../routes/utils");
const conn = require('../mysqlConnection');

const deleteFolder = (path) => {
	let folderDeleted = false;
	try {
		fs.rmdirSync(path, { recursive: true });
		folderDeleted = true;
	} catch (err) {
		folderDeleted = false;
	}
	return folderDeleted;
}

/* ============= Classes ========================= */
exports.getClasses = (_req, res) => {
	conn.query(`SELECT * FROM class`, (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", [], err.message));
		}
	});
}

exports.postClass = (req, res) => {
	const { name } = req.body;
	const sql = "insert into class(name) value(?)";
	conn.query(sql, [name], (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, "Class added!"));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

exports.deleteClass = (req, res) => {
	const classID = req.params.classID;
	const sql = "DELETE FROM class WHERE id=?";
	conn.query(sql, [classID], (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, "Class deleted successfully!"));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, "Please make sure no classes exist in this category!"));
		}
	});
}

exports.getClassStudents = (req, res) => {
	const classInstanceID = req.params.classInstanceID;
	const sql = `SELECT id, firstname, lastname FROM student WHERE classInstanceID=? ORDER BY firstname, lastname`;
	conn.query(sql, [classInstanceID], (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
		}
	});
}

exports.getClassCourses = (req, res) => {
	const classInstanceID = req.params.classInstanceID;
	const sql = `
		SELECT 
            ci.id as classInstanceID,
            c.name as name,
            c.category as category,
            cr.id as id
		FROM class_instance as ci, course_registration as cr, course as c 
		WHERE ci.id=? and cr.classInstanceID=ci.id and cr.courseID=c.id;
	`;
	conn.query(sql, [classInstanceID], (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", [], err.message));
		}
	});
}

exports.getClassInstances = (req, res) => {
	const classId = req.params.classID;
	const sql = `
        SELECT * from class_instance WHERE classID=?
    `;
	conn.query(sql, [classId], (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", [], err.message));
		}
	});
}

exports.getAllClassInstances = (req, res) => {
	const sql = `SELECT * from class_instance`;
	conn.query(sql, (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", [], err.message));
		}
	});
}

exports.getClassInstance = (req, res) => {
	const classInstanceID = req.params.classInstanceID;
	const sql = `SELECT * from class_instance WHERE id=?`;
	conn.query(sql, [classInstanceID], (err, result, _fields) => {
		try {
			if (err) throw err;
			if (result.length === 1) {
				res.json(ResponseWrapper("OK", result[0], ""));
			} else {
				res.json(ResponseWrapper("ERROR", null, "That id does not exist!"));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", [], err.message));
		}
	});
}

exports.postClassInstance = (req, res) => {
	const { name, classID, scheduleID, teacherID, year } = req.body;
	const sql = `insert into class_instance(name, classID, scheduleID, teacherID, year) 
            value(?, ?, ?, ?, ?)`;
	conn.query(sql, [name, classID, scheduleID, teacherID, year],
		(err, result, fields) => {
			try {
				if (err) throw err;
				res.json(ResponseWrapper("OK", result, ""));
			} catch (err) {
				res.json(ResponseWrapper("ERROR", null, err.message));
			}
		});
}

exports.putClassInstance = (req, res) => {
	const classInstanceID = req.params.classInstanceID;
	const { name, classID, scheduleID, teacherID, year } = req.body;
	const sql = `
        UPDATE class_instance SET name=?, classID=?, scheduleID=?, teacherID=?, year=?
        WHERE id=?
    `;
	conn.query(sql, [name, classID, scheduleID, teacherID, year, classInstanceID],
		(err, result, fields) => {
			try {
				if (err) throw err;
				res.json(ResponseWrapper("OK", result, ""));
			} catch (err) {
				res.json(ResponseWrapper("ERROR", null, err.message));
			}
		});
}

exports.deleteClassInstance = (req, res) => {
	const classInstanceID = req.params.classInstanceID;
	/* Remove the class folder if it exists */
	deleteFolder(`${public_dir}/${classInstanceID}`);
	/* Now remove the entry from the database table */
	const sql = "DELETE FROM class_instance WHERE id=?";
	conn.query(sql, classInstanceID, (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, "Class deleted!"));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}
/* =============================================== */

/* ================ Admins =========================== */
exports.validateSupervisorAdmin = (req, res, next) => {
	const adminID = req.params.adminID;
	const sql = `SELECT * FROM admin WHERE id=?`;
	conn.query(sql, [adminID], (err, result, fields) => {
		try {
			if (err) throw err;
			if (result.length === 1) {
				if (result[0].access === "supervisor") {
					next();
				} else {
					res.json(
						ResponseWrapper(
							"ERROR",
							null,
							"This admin does not have supervisor access!"));
				}
			} else {
				res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
		}
	});
}

exports.getAdmins = (req, res) => {
	const sql = `SELECT id, firstname, lastname, access FROM admin ORDER BY firstname, lastname`;
	conn.query(sql, (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
		}
	});
}

exports.getAdmin = (req, res) => {
	const id = req.params.id;
	const sql = `SELECT * FROM admin WHERE id=?`;
	conn.query(sql, [id], (err, result, fields) => {
		try {
			if (err) throw err;
			if (result.length === 1) {
				res.json(ResponseWrapper("OK", result[0], ""));
			} else {
				res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
		}
	});
}

exports.putAdmin = (req, res) => {
	const id = req.params.id;
	const { firstname, lastname, email, age, gender, password, access } = req.body;

	const sql = `UPDATE admin SET firstname=?, lastname=?,
                    email=?, password=?, age=?, gender=?, access=?
        WHERE id=?`;
	const args = [firstname, lastname, email, password, age, gender, access, id];

	conn.query(sql, args, (err, result, fields) => {
		try {
			if (err) throw err;
			if (result.affectedRows === 1) {
				res.json(ResponseWrapper("OK", null, "Admin updated successfully"));
			} else {
				res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

exports.deleteAdmin = (req, res) => {
	const id = req.params.id;
	const sql = `DELETE FROM admin WHERE id=?`;
	conn.query(sql, [id], (err, result, fields) => {
		try {
			if (err) throw err;
			if (result.affectedRows === 1) {
				res.json(ResponseWrapper("OK", "", "Admin deleted successfully!"));
			} else {
				res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

exports.postAdmin = (req, res) => {
	const { firstname, lastname,
		email, password, age, gender, access } = req.body;

	const sql = `
        INSERT INTO admin(firstname, lastname, email, password, age, gender, access)
        VALUE(?, ?, ?, ?, ?, ?, ?)
    `;


	const args = [firstname, lastname, email, password, age, gender, access];

	conn.query(sql, args, (err, result, fields) => {
		try {
			if (err) throw err;
			if (result.affectedRows === 1) {
				res.json(ResponseWrapper("OK", null, "Admin added successfully"));
			} else {
				res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});

}
/* =================================================== */

/* ================ Teachers =========================== */
exports.getTeachers = (req, res) => {
	const sql = `SELECT id, firstname, lastname FROM teacher ORDER BY firstname, lastname`;
	conn.query(sql, (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
		}
	});
}

exports.getTeacher = (req, res) => {
	const teacherID = req.params.teacherID;
	const sql = `SELECT * FROM teacher WHERE id=?`;
	conn.query(sql, [teacherID], (err, result, fields) => {
		try {
			if (err) throw err;
			if (result.length === 1) {
				res.json(ResponseWrapper("OK", result[0], ""));
			} else {
				res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
		}
	});
}

exports.putTeacher = (req, res) => {
	const teacherID = req.params.teacherID;
	const { firstname, lastname, email, address, phone, nationality, age, gender, password } = req.body;

	const sql = `UPDATE teacher SET firstname=?, lastname=?,
                    email=?, password=?, address=?, phone=?, nationality=?, age=?, gender=?
        WHERE id=?`;
	const args = [firstname, lastname, email, password, address, phone, nationality, age, gender, teacherID];

	conn.query(sql, args, (err, result, fields) => {
		try {
			if (err) throw err;
			if (result.affectedRows === 1) {
				res.json(ResponseWrapper("OK", null, "Teacher updated successfully"));
			} else {
				res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

exports.postTeacher = (req, res) => {
	const { firstname, lastname,
		email, password, address, phone, nationality, age, gender } = req.body;

	const sql = `
        INSERT INTO teacher(firstname, lastname, email, password, 
                            address, phone, nationality, age, gender)
        VALUE(?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;


	const args = [firstname, lastname, email, password, address, phone,
		nationality, age, gender];

	conn.query(sql, args, (err, result, fields) => {
		try {
			if (err) throw err;
			if (result.affectedRows === 1) {
				res.json(ResponseWrapper("OK", null, "Teacher added successfully"));
			} else {
				res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, "Something went wrong!"));
		}
	});
}

exports.deleteTeacher = (req, res) => {
	const teacherID = req.params.teacherID;
	const sql = `DELETE FROM teacher WHERE id=?`;
	conn.query(sql, [teacherID], (err, result, fields) => {
		try {
			if (err) throw err;
			if (result.affectedRows === 1) {
				res.json(ResponseWrapper("OK", "", "Teacher deleted successfully!"));
			} else {
				res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});

}

/* ===================================================== */

/* ================== Students ========================= */
exports.getStudents = (req, res) => {
	const sql = `SELECT id, firstname, lastname FROM student ORDER BY firstname, lastname`;
	conn.query(sql, (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
		}
	});
}

exports.getStudent = (req, res) => {
	const studentID = req.params.studentID;
	const sql = `SELECT * FROM student WHERE id=?`;
	conn.query(sql, [studentID], (err, result, fields) => {
		try {
			if (err) throw err;
			if (result.length === 1) {
				res.json(ResponseWrapper("OK", result[0], ""));
			} else {
				res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
		}
	});

}

exports.putStudent = (req, res) => {
	const studentID = req.params.studentID;
	const { firstname, lastname, email, address, phone, nationality, age, gender, password } = req.body;
	console.log(req.body);

	const sql = `UPDATE student SET firstname=?, lastname=?,
                    email=?, password=?, address=?, phone=?, nationality=?, age=?, gender=?
                 WHERE id=?`;
	const args = [firstname, lastname, email, password, address, phone, nationality, age, gender, studentID];

	conn.query(sql, args, (err, result, fields) => {
		try {
			if (err) throw err;
			if (result.affectedRows === 1) {
				res.json(ResponseWrapper("OK", null, "Student updated successfully"));
			} else {
				res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
		}
	});
}

exports.postStudent = (req, res) => {
	const { firstname, lastname, classInstanceID,
		email, password, address, phone, nationality, age, gender } = req.body;

	const sql = `
        INSERT INTO student(firstname, lastname, email, password, 
                            address, phone, nationality, age, gender, classInstanceID)
        VALUE(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;


	const args = [firstname, lastname, email, password, address, phone,
		nationality, age, gender, classInstanceID];

	conn.query(sql, args, (err, result, fields) => {
		try {
			if (err) throw err;
			if (result.affectedRows === 1) {
				res.json(ResponseWrapper("OK", null, "Student added successfully"));
			} else {
				res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

exports.deleteStudent = (req, res) => {
	const studentID = req.params.studentID;
	const sql = `DELETE FROM student WHERE id=?`;
	conn.query(sql, [studentID], (err, result, fields) => {
		try {
			if (err) throw err;
			if (result.affectedRows === 1) {
				res.json(ResponseWrapper("OK", "", "Student deleted successfully!"));
			} else {
				res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
		}
	});

}

/* Register manipulation endpoints  */
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
/* ===================================================== */

/* ================== Courses ========================== */
exports.getCourses = (req, res) => {
	const sql = `
        SELECT c.id, c.name, c.category  
        FROM course as c
        `;
	conn.query(sql, (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
		}
	});
}

exports.getCourse = (req, res) => {
	const courseID = req.params.courseID;
	const sql = `
        SELECT c.id, c.name, c.category  
        FROM course as c
        WHERE id=?
        `;
	conn.query(sql, [courseID], (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result[0], ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
		}
	});
}

exports.putCourse = (req, res) => {
	const courseID = req.params.courseID;
	const { name, category } = req.body;
	const sql = `
        UPDATE course
        SET name=?, category=?
        WHERE id=?
        `;
	conn.query(sql, [name, category, courseID], (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
		}
	});

}

exports.postCourse = (req, res) => {
	const { name, category } = req.body;
	const sql = `INSERT INTO course(name, category) value(?, ?)`;
	conn.query(sql, [name, category], (err, result, fields) => {
		try {
			if (err) throw err;
			if (result.affectedRows === 1) {
				res.json(ResponseWrapper("OK", result, ""));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

exports.findCourseCount = (req, res, next) => {
	const courseID = req.body.courseID;
	const sql = "SELECT COUNT(*) as total from course_registration where courseID=?";
	conn.query(sql, [courseID], (err, result, fields) => {
		try {
			if (result[0]['total'] >= 1) {
				res.json(ResponseWrapper("ERROR", null, "Course instances exist" +
					" for this course. Please make sure you delete" +
					" them from their respective classes first!"))
			} else {
				next();
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, "Something went wrong."));
		}
	});
}

exports.deleteCourse = (req, res) => {
	const courseID = req.body.courseID;
	const sql = "DELETE FROM course WHERE id=?";
	conn.query(sql, [courseID], (err, result, fields) => {
		try {
			if (err) throw err;
			if (result.affectedRows === 1) {
				res.json(ResponseWrapper("OK", result, ""));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

exports.getCourseInstances = (req, res) => {
	const courseID = req.params.courseID;
	const sql = `SELECT * from course_registration WHERE courseID=?`;
	conn.query(sql, [courseID], (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

exports.postCourseInstance = (req, res) => {
	const classInstanceID = req.body.classInstanceID;
	const teacherID = req.body.teacherID;
	const courseID = req.body.courseID;

	const sql = `
        INSERT INTO course_registration(classInstanceID, teacherID, courseID)
        VALUE (?, ?, ?)
    `;
	conn.query(sql, [classInstanceID, teacherID, courseID], (err, result, fields) => {
		try {
			if (err) throw err;
			if (result.affectedRows === 1) {
				res.json(ResponseWrapper("OK", result, ""));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

exports.deleteCourseInstance = (req, res) => {
	const courseInstanceID = req.params.courseInstanceID;
	const sql = "DELETE FROM course_registration WHERE id=?";
	conn.query(sql, [courseInstanceID], (err, result, fields) => {
		try {
			if (err) throw err;
			if (result.affectedRows === 1) {
				res.json(ResponseWrapper("OK", result, ""));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

exports.deleteCourseInstanceFolder = (req, res, next) => {
	const { courseInstanceID } = req.params;
	const sql = "SELECT classInstanceID FROM course_registration WHERE id=?";
	conn.query(sql, [courseInstanceID], (err, result, fields) => {
		try {
			if (err) throw err;
			if (result.length === 1) {
				const classInstanceID = result[0].classInstanceID;
				deleteFolder(`${public_dir}/${classInstanceID}/${courseInstanceID}`);
				next();
			} else {
				res.json(ResponseWrapper("ERROR", null, "Something went wrong"));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}
/* ===================================================== */

/* =================== Events ========================== */
exports.getEvents = (req, res) => {
	const sql = `
        SELECT id, title, description, DATE_FORMAT(due, '%Y-%m-%d %T') as due, classInstanceID
        FROM event ORDER BY due ASC
    `;
	conn.query(sql, (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

exports.deleteEvents = (req, res) => {
	const sql = "DELETE FROM event WHERE due < NOW()";
	conn.query(sql, (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", null, "Done events were deleted successfully!"));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

exports.deleteEventFolders = (req, res, next) => {
	const sql = "SELECT id FROM event WHERE due < NOW()";
	conn.query(sql, (err, result, fields) => {
		try {
			if (err) throw err;
			/* Delete the folders */
			for (let i = 0; i < result.length; i++) {
				deleteFolder(`${public_dir}/events/${result[i].id}`);
			}
			next();
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

exports.getEvent = (req, res) => {
	const eventID = req.params.eventID;
	const sql = `
        SELECT id, title, description, DATE_FORMAT(due, '%Y-%m-%dT%T') as due, classInstanceID
        FROM event WHERE id=?`;
	conn.query(sql, [eventID], (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result[0], ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

exports.postEvent = (req, res) => {
	try {
		let { title, description, classInstanceID, due } = req.body;
		if (parseInt(classInstanceID) === 0) classInstanceID = null;

		const sql = `INSERT INTO event(title, description, classInstanceID, due) VALUE(?, ?, ?, ?)`;
		const args = [title, description, classInstanceID, due];

		conn.query(sql, args, (err, result, fields) => {
			try {
				if (err) throw err;
				res.json(ResponseWrapper("OK", null, ""));
			} catch (err) {
				res.json(ResponseWrapper("ERROR", null, err.message));
			}
		});
	} catch (err) {
		res.json(ResponseWrapper("ERROR", null, err.message));
	}
}

exports.putEvent = (req, res) => {
	const eventID = req.params.eventID;
	const { title, description, due } = req.body;
	const sql = `UPDATE event SET title=?, description=?, due=? WHERE id=?`;
	conn.query(sql, [title, description, due, eventID], (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

exports.deleteEvent = (req, res) => {
	const eventID = req.params.eventID;
	const sql = `DELETE FROM event WHERE id=?`;
	conn.query(sql, [eventID], (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

exports.getEventImages = (req, res) => {
	const sql = `SELECT * FROM event_image WHERE eventID=?`;
	const eventID = req.params.eventID;
	conn.query(sql, eventID, (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

/* Delete the database image entries for a specific event */
exports.deleteEventImages = (req, res, next) => {
	/* If there was a problem with deleting the event directory in the
	 * filesystem */
	if (!req.eventDirDeleted) {
		res.json(ResponseWrapper("ERROR", null, req.eventDirError.message));
		return;
	}
	const sql = `DELETE FROM event_image WHERE eventID=?`;
	const eventID = req.params.eventID;
	conn.query(sql, eventID, (err, result, fields) => {
		try {
			if (err) throw err;
			next();
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

/* Deletes the directory in the filesystem of a particular event */
exports.deleteEventDirectory = (req, res, next) => {
	const eventID = req.params.eventID;
	/* We set the eventDirDirectory and eventDirError fields for the other
	 * callbacks down the line to check */
	try {
		fs.rmdirSync(`${public_dir}/events/${eventID}`, { recursive: true });
		req.eventDirDeleted = true;
	} catch (err) {
		req.eventDirDeleted = false;
		req.eventDirError = err;
	} finally {
		next();
	}
}

/* Defines the storage engine that will be used to determin the filname and
 * filepath for each event image, when it is uploaded. */
exports.eventImageStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		const eventID = req.params.eventID;
		const dest = `${public_dir}/events/${eventID}`;
		/* If the destination folder does not exist, create it */
		try {
			if (!fs.existsSync(dest)) {
				fs.mkdirSync(dest, { recursive: true });
			}
		} catch (err) {
			console.log(err.message);
		}
		cb(null, dest);
	},
	filename: (req, file, cb) => {
		cb(null, file.originalname);
	}
});

exports.downloadEventImage = (req, res) => {
	const eventID = req.params.eventID;
	const filename = req.params.filename;
	try {
		res.download(`${public_dir}/events/${eventID}/${filename}`);
	} catch (err) {
		res.json(ResponseWrapper("ERROR", [], "There was an error"));
	}
}

/* After an image is uploaded in the filesystem, handles adding an event_image
 * entry in the database */
exports.handleImageUpload = (req, res) => {
	if (req.uploadFailed) {
		res.json(ResponseWrapper("ERROR", null, req.uploadMessage));
		return;
	}
	const eventID = req.params.eventID;
	const sql = "INSERT INTO event_image(filename, eventID) value(?, ?)";
	conn.query(sql, [req.file.originalname, eventID], (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, "Image uploaded!"));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

/* ===================================================== */

/* =================== Schedules ======================= */
exports.getSchedules = (req, res) => {
	const sql = "SELECT * from schedule";
	conn.query(sql, (err, result, _fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

/* Insert a new schedule, this function is a middleware
* when it succeeds it passes contron to another function to add a list of
* default days */
exports.postSchedule = (req, res, next) => {
	try {
		const { name } = req.body;
		const sql = "INSERT INTO schedule(name) VALUE(?)";
		conn.query(sql, [name], (err, result, _fields) => {
			try {
				if (err) throw err;
				req.scheduleID = result.insertId;
				next();
			} catch (err) {
				res.json(ResponseWrapper("ERROR", null, err.message));
			}
		});
	} catch (err) {
		res.json(ResponseWrapper("ERROR", null, err.message));
	}
}
/* Insert 5 default days for the new schedule */
exports.insertDefaultScheduleDays = (req, res) => {
	try {
		const scheduleID = conn.escape(req.scheduleID);
		const sql = `
		INSERT INTO schedule_day(scheduleID, name, day) VALUES
			(${scheduleID}, "Monday", 1),
			(${scheduleID}, "Tuesday", 2),
			(${scheduleID}, "Wednesday", 3),
			(${scheduleID}, "Thursday", 4),
			(${scheduleID}, "Friday", 5)
	`;
		conn.query(sql, (err, result, fields) => {
			try {
				if (err) throw err;
				res.json(ResponseWrapper("OK", null, "Schedule was successfully added!"));
			} catch (err) {
				res.json(ResponseWrapper("ERROR", null, err.message));
			}
		});
	} catch (err) {
		res.json(ResponseWrapper("ERROR", null, err.message));
	}
}

exports.putSchedule = (req, res) => {
	try {
		const scheduleID = req.params.scheduleID;
		const { name } = req.body;
		const sql = "UPDATE schedule SET name=? WHERE id=?";
		conn.query(sql, [name, scheduleID], (err, result, _fields) => {
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

exports.deleteSchedule = (req, res) => {
	const scheduleID = req.params.scheduleID;
	const sql = "DELETE FROM schedule WHERE id=?";
	conn.query(sql, [scheduleID], (err, result, _fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

/* Day manipulation functions */
exports.getDays = (req, res) => {
	const scheduleID = req.params.scheduleID;
	/* Gets all the days for a particular schedule, and it orders them according to
	 * the day index, which is the `day` column*/
	const sql = "SELECT * FROM schedule_day WHERE scheduleID=? ORDER BY day";

	conn.query(sql, [scheduleID], (err, result, _fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

exports.postDay = (req, res) => {
	const scheduleID = req.params.scheduleID;
	const { name, day_index } = req.body;
	const sql = `
            INSERT INTO schedule_day(scheduleID, name, day) 
            VALUE(?, ?, ?)`;
	conn.query(sql, [scheduleID, name, day_index], (err, result, _fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

exports.putDay = (req, res) => {
	const { dayID, scheduleID } = req.params;
	const { name, day_index } = req.body;
	const sql = `
            UPDATE schedule_day
            SET scheduleID=?, name=?, day=?
            WHERE id=?`;
	conn.query(sql, [scheduleID, name, day_index, dayID], (err, result, _fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

exports.deleteDay = (req, res) => {
	const dayID = req.params.dayID;
	const sql = `DELETE FROM schedule_day WHERE id=?`;
	conn.query(sql, [dayID], (err, result, _fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

/* Hour manipulation functions */
exports.getHours = (req, res) => {
	const dayID = req.params.dayID;
	const sql = `
        SELECT dh.id, dh.dayID, c.name as course_name, dh.start, dh.end, dh.courseInstanceID
        FROM day_hours as dh, course_registration as cr, course as c
        WHERE dayID=? and cr.courseID=c.id and dh.courseInstanceID=cr.id`;

	conn.query(sql, [dayID], (err, result, _fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

exports.postHour = (req, res) => {
	const dayID = req.params.dayID;
	const { start, end, courseInstanceID } = req.body;

	/* First check if the teacher already teaches at that hour at that day.
	 * We have found the day index in a previous middleware and stored in 
	 * req.params.dayIndex */
	/*
	const hours = req.params.hours;
	for (let i = 0; i < hours.length; i++) {
		if (hours[i].hour === hour && hours[i].day === req.params.dayIndex) {
			res.json(ResponseWrapper("ERROR", null,
				"Sorry the teacher for this course is already teaching at this hour of the day"));
			return;
		}
	}
	*/

	const sql = `
            INSERT INTO day_hours(start, end, courseInstanceID, dayID) 
            VALUE(?, ?, ?, ?)`;
	conn.query(sql, [start, end, courseInstanceID, dayID], (err, result, _fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

exports.putHour = (req, res) => {
	const hourID = req.params.hourID;
	const { start, end, courseInstanceID } = req.body;

	/* First check if the teacher already teaches at that hour at that day.
	 * The third inequality check in the if statement makes sure that we do 
	 * not include the hour we are trying to modify in the list of hours we do
	 * not want to have collision with. That would mean that the new hour
	 * collides with the hour we are trying to modify, which does not make
	 * sense. */
	/*
	const hours = req.params.hours;
	for (let i = 0; i < hours.length; i++) {
		if (hours[i].hour === hour
			&& hours[i].day === req.params.dayIndex
			&& hours[i].id !== parseInt(hourID)) {

			res.json(ResponseWrapper("ERROR", null,
				"Sorry the teacher for this course is already teaching at this hour of the day"));
			return;
		}
	}
	*/
	const sql = `
            UPDATE day_hours SET courseInstanceID=?, start=?, end=? 
            WHERE id=?`;
	conn.query(sql, [courseInstanceID, start, end, hourID], (err, result, _fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

exports.deleteHour = (req, res) => {
	const hourID = req.params.hourID;
	const sql = "DELETE FROM day_hours WHERE id=?";
	conn.query(sql, [hourID], (err, result, _fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

exports.getAllCourseInstances = (req, res) => {
	const sql = `
        SELECT c.name as course_name,
            cr.id,
            t.firstname,
            t.lastname,
            ci.name as class_name
        FROM course_registration as cr, course as c, teacher as t, class_instance as ci
        WHERE cr.courseID=c.id and cr.teacherID=t.id and cr.classInstanceID=ci.id`;
	conn.query(sql, (err, result, fields) => {
		try {
			if (err) throw err;
			res.json(ResponseWrapper("OK", result, ""));
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

/* Teacher hour collision prevention utility middlewares */
exports.findTeacherID = (req, res, next) => {
	const { courseInstanceID } = req.body;
	const sql = "SELECT teacherID from course_registration WHERE id=?";
	conn.query(sql, [courseInstanceID], (err, result, fields) => {
		try {
			if (err) throw err;
			if (result.length === 1) {
				req.params.teacherID = result[0].teacherID;
				next();
			} else {
				res.json(ResponseWrapper("ERROR", result, "This teacher does not exit!"));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

exports.findDayIndex = (req, res, next) => {
	const dayID = req.params.dayID;
	const sql = "SELECT day from schedule_day WHERE id=?";
	conn.query(sql, [dayID], (err, result, _fields) => {
		try {
			if (err) throw err;
			if (result.length === 1) {
				req.params.dayIndex = result[0].day;
				next();
			} else {
				res.json(ResponseWrapper("ERROR", null, "This day does not exit!"));
			}
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}

exports.findTeacherHours = (req, res, next) => {
	const teacherID = req.params.teacherID;
	const sql = `
        SELECT h.id, h.start, h.end, d.day
        FROM day_hours as h, schedule_day as d, course_registration as cr
        WHERE h.dayID=d.id and h.courseInstanceID=cr.id and cr.teacherID=?
    `;
	conn.query(sql, [teacherID], (err, result, fields) => {
		try {
			if (err) throw err;
			req.params.hours = result;
			next();
		} catch (err) {
			res.json(ResponseWrapper("ERROR", null, err.message));
		}
	});
}
/* ===================================================== */
