const express = require("express");
const studentHandler = require("../handlers/students");
const router = express.Router();

const multer = require("multer");
const fileHandler = require("../handlers/files");

const uploadFile = multer({ storage: fileHandler.fileStorage });
const uploadProfilePic = multer({
	storage: fileHandler.profilePictureStorage ,
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

const { validateStudent } = require("../routes/utils");


/*=============== Information about a student ==========================*/
/* Get information about a student */
router.get("/:studentID",
  validateStudent,
  studentHandler.getStudent);

/* Update the student information */
router.put("/:studentID",
  validateStudent,
  studentHandler.putStudent);

/* Get a list of all grades on all the courses taken by a student */
router.get("/:studentID/grades",
  validateStudent,
  studentHandler.getAllGrades);

/* Get a list of all attendance sessions */
router.get("/:studentID/attendance",
  validateStudent,
  studentHandler.getAllAttendanceSessions);

/* Upload a profile picture */
router.post("/:studentID/picture",
  validateStudent,
  studentHandler.setTypeAndId,
  uploadProfilePic.single("file"),
  studentHandler.postProfilePic
);

/* Download a profile picture */
router.get("/:studentID/picture", studentHandler.downloadProfilePic);
/*==================================================*/

/* ============== Events ======================= */
/* Get the list of events */
router.get("/:studentID/events",
  validateStudent,
  studentHandler.getEvents);

/* Get the list of images for an event */
router.get("/:studentID/events/:eventID/images",
	validateStudent,
	studentHandler.getEventImages);

/* Download an event image */
router.get("/:studentID/events/:eventID/images/:filename",
	studentHandler.downloadEventImage);

/*=============== Schedule ==========================*/
// get the schedule of the class of the student
router.get("/:studentID/schedule",
  validateStudent,
  studentHandler.getSchedule);
/*==================================================*/

/*=============== Courses ==========================*/
/* Get the list of courses for a student */
router.get("/:studentID/courses",
  validateStudent,
  studentHandler.getCourses);

/* Get information about a course */
router.get("/:studentID/courses/:courseInstanceID",
  validateStudent,
  studentHandler.getCourse);

/* Get the number of hours per week for a course */
router.get("/:studentID/courses/:courseInstanceID/hours",
  validateStudent,
  studentHandler.getCourseHoursPerWeek);

/* Get the last grade of a student for a particular course */
router.get("/:studentID/courses/:courseInstanceID/lastgrade",
  validateStudent,
  studentHandler.getCourseLastGrade);

/* ==> Attendance */
/* Get a list of attendance sessions has been/not been present in */
router.get("/:studentID/courses/:courseInstanceID/attendance",
  validateStudent,
  studentHandler.getCourseAttendance);

/* ==> Assignments */
/* Get a list of assignments */
router.get("/:studentID/courses/:courseInstanceID/assignments",
  validateStudent,
  studentHandler.getCourseAssignments);

/* Get information about an assignment */
router.get("/:studentID/courses/:courseInstanceID/assignments/:assignmentID",
  validateStudent,
  studentHandler.getCourseAssignment);

/* Get a list of files for an assignment */
router.get("/:studentID/courses/:courseInstanceID/assignments/:assignmentID/files",
  validateStudent,
  studentHandler.getCourseAssignmentFiles);

/* Get the list of files the student has uploaded so far to an assignment */
router.get("/:studentID/courses/:courseInstanceID/assignments/:assignmentID/studentfiles",
  validateStudent,
  studentHandler.getStudentFiles);

/* Upload a file on to the specific assignment */
router.post("/:studentID/courses/:courseInstanceID/assignments/:assignmentID/studentfiles",
  validateStudent,
  studentHandler.getCourseClassInstanceId,
  uploadFile.single("file"),
  studentHandler.postStudentFile);

/* TODO: Add student validation, Download a student file */
router.get("/:studentID/courses/:courseInstanceID/assignments/:assignmentID/studentfiles/:filename",
  studentHandler.getCourseClassInstanceId,
  studentHandler.downloadStudentFile
);

/* Delete a student file */
router.delete("/:studentID/courses/:courseInstanceID/assignments/:assignmentID/studentfiles/:fileID",
  studentHandler.getCourseClassInstanceId,
  studentHandler.deleteStudentFile,
  studentHandler.deleteStudentFileEntry
);

/* TODO: Add token validation, Download a course or assignment file */
router.get("/:studentID/courses/:courseInstanceID/files/:filename",
  studentHandler.getCourseClassInstanceId,
  studentHandler.downloadCourseFile
);


/* ==> Posts */
/* Get all the posts for this course */
router.get("/:studentID/courses/:courseInstanceID/posts",
  validateStudent,
  studentHandler.getCoursePosts);

/* Insert a new post */
router.post("/:studentID/courses/:courseInstanceID/posts",
  validateStudent,
  studentHandler.insertCoursePost,
  studentHandler.insertCoursePostBody
);

/* Get all the comments of a post */
router.get("/:studentID/courses/:courseInstanceID/posts/:postID/comments",
  validateStudent,
	studentHandler.getComments);
	
/* Create a new comment for a specific post */
router.post("/:studentID/courses/:courseInstanceID/posts/:postID/comments",
  validateStudent,
	studentHandler.postComment);

/* Delete a comment */
router.delete("/:studentID/courses/:courseInstanceID/posts/:postID/comments/:commentID",
  validateStudent,
  studentHandler.verifyStudentComment,
	studentHandler.deleteComment);

/* Modify a comment */
router.put("/:studentID/courses/:courseInstanceID/posts/:postID/comments/:commentID",
  validateStudent,
	studentHandler.verifyStudentComment,
	studentHandler.putComment);




/* ==> General files */
/* Get the general files for a course */
router.get("/:studentID/courses/:courseInstanceID/files",
  validateStudent,
  studentHandler.getCourseFiles);

/* ==> Grades */
/* Get the grades for this course */
router.get("/:studentID/courses/:courseInstanceID/grades",
  validateStudent,
  studentHandler.getCourseGrades);
/*==================================================*/

module.exports = router;
