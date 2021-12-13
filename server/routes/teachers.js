const express = require("express");
const router = express.Router();

const teacherHandler = require('../handlers/teachers');
const { validateTeacher } = require('./utils');

const multer = require("multer");
const fileHandler = require("../handlers/files");

const uploadProfilePic = multer({
	storage: fileHandler.profilePictureStorage,
	fileFilter: (req, file, cb) => {
		const splitArray = file.originalname.split(".");
		const mimeType = splitArray[splitArray.length - 1];
		if (mimeType !== "png" && mimeType !== "jpg" && mimeType !== "jpeg") {
			req.uploadFailed = true;
			req.uploadMessage = "Only images allowed";
			cb(null, false);
			return;
		}
		cb(null, true)
	},
	limits: {
		fileSize: 15 * 1024 * 1024 /* Limits file size to 15mb */
	}
});
const uploadFile = multer({ storage: fileHandler.fileStorage });

/* ======================== Teacher information ==================== */

/* get information about a teacher */
router.get("/:teacherID", validateTeacher, teacherHandler.getTeacher);

/* update a teacher information */
router.post("/:teacherID", teacherHandler.postTeacher);

/* Upload a profile picture */
router.post("/:teacherID/picture",
	validateTeacher,
	teacherHandler.setTypeAndId,
	uploadProfilePic.single("file"),
	teacherHandler.postProfilePic
);

/* Download a profile picture */
router.get("/:teacherID/picture",
	teacherHandler.downloadProfilePic);
/* ================================================================= */

router.get("/:teacherID/gradeLimits", teacherHandler.getGradeLimits);

/* ==================== Events ============================ */
/* Get the list of events */
router.get("/:teacherID/events",
	validateTeacher,
	teacherHandler.getEvents);

/* Get the list of images for an event */
router.get("/:teacherID/events/:eventID/images",
	validateTeacher,
	teacherHandler.getEventImages);

/* Download an event image */
router.get("/:teacherID/events/:eventID/images/:filename",
	teacherHandler.downloadEventImage);
/* ======================================================== */

/*======================= Schedule ================================*/

// get the teacher schedule
router.get("/:teacherID/schedule",
	validateTeacher,
	teacherHandler.getSchedule);

/*=================================================================*/


/*============ Class the teacher is advisor ====================*/

// get the class courses
router.get("/:teacherID/class",
	validateTeacher,
	teacherHandler.getClassCourses);

/*=================================================================*/


/*======================= Courses =================================*/

/* Get a list of courses taught by the teacher */
router.get("/:teacherID/courses",
	validateTeacher,
	teacherHandler.getCourses);

/* ==> Course specific endpoints */

/* Get information about a course taught by the teacher */
router.get("/:teacherID/courses/:courseInstanceID",
	validateTeacher,
	teacherHandler.getCourse);

/* Get the number of hours per week of a particular course */
router.get("/:teacherID/courses/:courseInstanceID/hours",
	validateTeacher,
	teacherHandler.getCourseHoursPerWeek);

/* Get all the posts in this course */
router.get("/:teacherID/courses/:courseInstanceID/posts",
	validateTeacher,
	teacherHandler.getCoursePosts);

/* Create a new course post */
router.post("/:teacherID/courses/:courseInstanceID/posts",
	validateTeacher,
	teacherHandler.insertCoursePost,
	teacherHandler.insertCoursePostBody
);

/* Update a post */
router.put("/:teacherID/courses/:courseInstanceID/posts/:postID",
	validateTeacher,
	teacherHandler.updatePost
);

/* Delete a post */
router.delete("/:teacherID/courses/:courseInstanceID/posts/:postID",
	validateTeacher,
	teacherHandler.deletePost
);

/* Get the list of students in that course */
router.get("/:teacherID/courses/:courseInstanceID/students",
	validateTeacher,
	teacherHandler.getCourseStudents);

/* => Assignments of a course */
/* Get the list of assignments for that course */
router.get("/:teacherID/courses/:courseInstanceID/assignments",
	validateTeacher,
	teacherHandler.getCourseAssignments);

/* Create a new assignment for that course */
router.post("/:teacherID/courses/:courseInstanceID/assignments",
	validateTeacher,
	teacherHandler.postCourseAssignment);

/* Get information about a single assignment */
router.get("/:teacherID/courses/:courseInstanceID/assignments/:assignmentID",
	validateTeacher,
	teacherHandler.getCourseAssignment);

/* Update a course assignment */
router.put("/:teacherID/courses/:courseInstanceID/assignments/:assignmentID",
	validateTeacher,
	teacherHandler.putCourseAssignment);

/* Delete an assignment */
router.delete("/:teacherID/courses/:courseInstanceID/assignments/:assignmentID",
	validateTeacher,
	teacherHandler.getCourseClassInstanceId,
	teacherHandler.deleteAssignmentFiles,
	teacherHandler.deleteAssignmentStudentFiles,
	teacherHandler.deleteCourseAssignment);

/* Get a list of student files for an assignment */
router.get("/:teacherID/courses/:courseInstanceID/assignments/:assignmentID/studentfiles",
	validateTeacher,
	teacherHandler.getAssignmentStudentFiles);

/* Download a student file */
router.get("/:teacherID/courses/:courseInstanceID/assignments/:assignmentID/studentfiles/:studentID/:filename",
	teacherHandler.getCourseClassInstanceId,
	teacherHandler.downloadStudentFile);

/* Get the list of assignment files, which all the students can see */
router.get("/:teacherID/courses/:courseInstanceID/assignments/:assignmentID/files",
	validateTeacher,
	teacherHandler.getAssignmentFiles);

/* Post a new assignment file */
router.post("/:teacherID/courses/:courseInstanceID/assignments/:assignmentID/files",
	validateTeacher,
	teacherHandler.getCourseClassInstanceId,
	uploadFile.single("file"),
	teacherHandler.postAssignmentFile);

/* Download a course or assignment file */
router.get("/:teacherID/courses/:courseInstanceID/files/:filename",
	teacherHandler.getCourseClassInstanceId,
	teacherHandler.downloadCourseFile);

/* Get the list of general course files */
router.get("/:teacherID/courses/:courseInstanceID/files",
	validateTeacher,
	teacherHandler.getCourseFiles);

/* Upload a general course file */
router.post("/:teacherID/courses/:courseInstanceID/files",
	validateTeacher,
	teacherHandler.getCourseClassInstanceId,
	uploadFile.single("file"),
	teacherHandler.postCourseFile);

/* Delete a general course file or an assignment file
 * --------------------------------------------------
 * this works because both
 * assignment files and general course files are stored in the same folder, the
 * only difference is in the db table where general files have an
 * assignmentID=null */
router.delete("/:teacherID/courses/:courseInstanceID/files/:fileID",
	validateTeacher,
	teacherHandler.getCourseClassInstanceId,
	teacherHandler.deleteCourseFile,
	teacherHandler.deleteCourseFileEntry
);

/* => Attendance */
/* Get a list of all sessions done for this course */
router.get("/:teacherID/courses/:courseInstanceID/attendance",
	validateTeacher,
	teacherHandler.getCourseAttendanceSessions);

/* Get information about an attendance session, aka the attendance of all
 * students */
router.get("/:teacherID/courses/:courseInstanceID/attendance/:sessionID",
	validateTeacher,
	teacherHandler.getCourseAttendanceSession);

/* Create a new attendance session */
router.post("/:teacherID/courses/:courseInstanceID/attendance",
	validateTeacher,
	teacherHandler.postCourseAttendanceSession);

/* Enter information about an attendance session */
router.post("/:teacherID/courses/:courseInstanceID/attendance/:sessionID",
	validateTeacher,
	teacherHandler.postCourseSessionInfo);

/* Delete an attendance session */
router.delete("/:teacherID/courses/:courseInstanceID/attendance/:sessionID",
	validateTeacher,
	teacherHandler.deleteCourseAttendanceSession);

/* Update session information about a student */
router.post("/:teacherID/courses/:courseInstanceID/attendance/:sessionID/:studentID",
	validateTeacher,
	teacherHandler.updateCourseSessionStudent);

/* ==> Grades */
/* Get a list of all the grades in this course */
router.get("/:teacherID/courses/:courseInstanceID/grades",
	validateTeacher,
	teacherHandler.getCourseGrades);

/* Insert a new array of grades, this may be an exam result */
router.post("/:teacherID/courses/:courseInstanceID/grades",
	validateTeacher,
	teacherHandler.postCourseGrades);

/* Delete an array of grades */
router.delete("/:teacherID/courses/:courseInstanceID/grades",
	validateTeacher,
	teacherHandler.deleteCourseGrades);

/* Update a grade */
router.put("/:teacherID/courses/:courseInstanceID/grades/:gradeID",
	validateTeacher,
	teacherHandler.putCourseGrade);

/* Delete a grade */
router.delete("/:teacherID/courses/:courseInstanceID/grades/:gradeID",
	validateTeacher,
	teacherHandler.deleteCourseGrade);


/* ==> Register endpoints  */

/* Get all the marks for a student */
router.get("/:teacherID/students/:studentID/marks",
	validateTeacher,
	teacherHandler.getStudentMarks);

/* Insert a new mark for a student */
router.post("/:teacherID/students/:studentID/marks",
	validateTeacher,
	teacherHandler.postStudentMark);

/* Update a student mark */
router.put("/:teacherID/students/:studentID/marks/:markID",
	validateTeacher,
	teacherHandler.putStudentMark);

/* Delete a student mark */
router.delete("/:teacherID/students/:studentID/marks/:markID",
	validateTeacher,
	teacherHandler.deleteStudentMark);
/*=================================================================*/

/* ============== Post comments endpoints ===================== */
/* Get all the comments of a post */
router.get("/:teacherID/courses/:courseInstanceID/posts/:postID/comments",
	validateTeacher,
	teacherHandler.getComments);

/* Create a new comment for a specific post */
router.post("/:teacherID/courses/:courseInstanceID/posts/:postID/comments",
	validateTeacher,
	teacherHandler.postComment);

/* Delete a comment */
router.delete("/:teacherID/courses/:courseInstanceID/posts/:postID/comments/:commentID",
	validateTeacher,
	teacherHandler.deleteComment);

/* Modify a comment */
router.put("/:teacherID/courses/:courseInstanceID/posts/:postID/comments/:commentID",
	validateTeacher,
	teacherHandler.verifyTeacherComment,
	teacherHandler.putComment);
/* ============================================================ */

/* Get attendance for a date as excel sheet */
router.get("/:teacherID/courses/:courseInstanceID/attendanceExcel", teacherHandler.exportAttendanceToExcel);

module.exports = router;
