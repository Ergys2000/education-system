const jwt = require("jsonwebtoken");
const express = require("express");
const multer = require("multer");
const adminHandler = require("../handlers/admins");
const router = express.Router();
const { validateAdmin } = require("./utils");


/*================== Classes ====================================*/
router.get("/:adminID/classes",
	validateAdmin,
	adminHandler.getClasses);

router.post("/:adminID/classes",
	validateAdmin,
	adminHandler.postClass);

router.delete("/:adminID/classes/:classID",
	validateAdmin,
	adminHandler.deleteClass);

router.get("/:adminID/classes/:classID/instances",
	validateAdmin,
	adminHandler.getClassInstances);

router.get("/:adminID/classInstances",
	validateAdmin,
	adminHandler.getAllClassInstances);

router.get("/:adminID/classInstances/:classInstanceID",
	validateAdmin,
	adminHandler.getClassInstance);

router.get("/:adminID/classInstances/:classInstanceID/courses",
	validateAdmin,
	adminHandler.getClassCourses);

router.get("/:adminID/classInstances/:classInstanceID/students",
	validateAdmin,
	adminHandler.getClassStudents);

router.post("/:adminID/classInstances",
	validateAdmin,
	adminHandler.postClassInstance);

router.put("/:adminID/classInstances/:classInstanceID",
	validateAdmin,
	adminHandler.putClassInstance);

router.delete("/:adminID/classInstances/:classInstanceID",
	validateAdmin,
	adminHandler.deleteClassInstance);

/*===============================================================*/

/* ============== Admins ================================= */
router.get("/:adminID/admins",
	validateAdmin,
	adminHandler.validateSupervisorAdmin,
	adminHandler.getAdmins);
router.post("/:adminID/admins",
	validateAdmin,
	adminHandler.validateSupervisorAdmin,
	adminHandler.postAdmin);
router.get("/:adminID/admins/:id",
	validateAdmin,
	adminHandler.validateSupervisorAdmin,
	adminHandler.getAdmin);
router.put("/:adminID/admins/:id",
	validateAdmin,
	adminHandler.validateSupervisorAdmin,
	adminHandler.putAdmin);
router.delete("/:adminID/admins/:id",
	validateAdmin,
	adminHandler.validateSupervisorAdmin,
	adminHandler.deleteAdmin);
/* ========================================================= */

/* ============== Teachers ================================= */
router.get("/:adminID/teachers",
	validateAdmin,
	adminHandler.getTeachers);
router.post("/:adminID/teachers",
	validateAdmin,
	adminHandler.postTeacher);

router.get("/:adminID/teachers/:teacherID",
	validateAdmin,
	adminHandler.getTeacher);
router.put("/:adminID/teachers/:teacherID",
	validateAdmin,
	adminHandler.putTeacher);
router.delete("/:adminID/teachers/:teacherID",
	validateAdmin,
	adminHandler.deleteTeacher);

/* ========================================================= */

/* ================= Students ============================== */
router.get("/:adminID/students",
	validateAdmin,
	adminHandler.getStudents);
router.post("/:adminID/students",
	validateAdmin,
	adminHandler.postStudent);

router.get("/:adminID/students/:studentID",
	validateAdmin,
	adminHandler.getStudent);
router.put("/:adminID/students/:studentID",
	validateAdmin,
	adminHandler.putStudent);
router.delete("/:adminID/students/:studentID",
	validateAdmin,
	adminHandler.deleteStudent);

/* Getting the grades for the register page */
router.get("/:adminID/students/:studentID/marks",
	validateAdmin,
	adminHandler.getStudentMarks);
router.post("/:adminID/students/:studentID/marks",
	validateAdmin,
	adminHandler.postStudentMark);
router.put("/:adminID/students/:studentID/marks/:markID",
	validateAdmin,
	adminHandler.putStudentMark);
router.delete("/:adminID/students/:studentID/marks/:markID",
	validateAdmin,
	adminHandler.deleteStudentMark);
/* ========================================================= */


/* =============== Courses ============================== */

router.get("/:adminID/courses",
	validateAdmin,
	adminHandler.getCourses);
router.post("/:adminID/courses",
	validateAdmin,
	adminHandler.postCourse);
router.delete("/:adminID/courses",
	validateAdmin,
	adminHandler.findCourseCount, adminHandler.deleteCourse);

router.get("/:adminID/courses/:courseID",
	validateAdmin,
	adminHandler.getCourse);
router.put("/:adminID/courses/:courseID",
	validateAdmin,
	adminHandler.putCourse);
router.get("/:adminID/courses/:courseID/instances",
	validateAdmin,
	adminHandler.getCourseInstances);

/* This function is used by the schedule page to manipulate 
 * which course corresponds to that hour of the day */
router.get("/:adminID/courseInstances",
	validateAdmin,
	adminHandler.getAllCourseInstances);
router.post("/:adminID/courseInstances",
	validateAdmin,
	adminHandler.postCourseInstance);

router.delete("/:adminID/courseInstances/:courseInstanceID",
	validateAdmin,
	adminHandler.deleteCourseInstanceFolder,
	adminHandler.deleteCourseInstance);

/* ====================================================== */


/* =================== Events ========================== */
const uploadEventImage = multer({
	storage: adminHandler.eventImageStorage,
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

router.get("/:adminID/events",
	validateAdmin,
	adminHandler.getEvents);

router.delete("/:adminID/events",
	validateAdmin,
	adminHandler.deleteEventFolders,
	adminHandler.deleteEvents
);

router.post("/:adminID/events",
	validateAdmin,
	adminHandler.postEvent
);

router.get("/:adminID/events/:eventID",
	validateAdmin,
	adminHandler.getEvent);

router.put("/:adminID/events/:eventID",
	validateAdmin,
	adminHandler.putEvent);

router.delete("/:adminID/events/:eventID",
	validateAdmin,
	adminHandler.deleteEventDirectory,
	adminHandler.deleteEventImages,
	adminHandler.deleteEvent);

router.get("/:adminID/events/:eventID/images",
	validateAdmin,
	adminHandler.getEventImages);

router.get("/:adminID/events/:eventID/images/:filename",
	adminHandler.downloadEventImage);

router.post("/:adminID/events/:eventID/images",
	uploadEventImage.single("file"),
	adminHandler.handleImageUpload);
/* ===================================================== */

/* =================== Schedules ======================= */
router.get("/:adminID/schedules",
	validateAdmin,
	adminHandler.getSchedules);
router.post("/:adminID/schedules",
	validateAdmin,
	adminHandler.postSchedule,
	adminHandler.insertDefaultScheduleDays);
router.put("/:adminID/schedules/:scheduleID",
	validateAdmin,
	adminHandler.putSchedule);
router.delete("/:adminID/schedules/:scheduleID",
	validateAdmin,
	adminHandler.deleteSchedule);

router.get("/:adminID/schedules/:scheduleID/days",
	validateAdmin,
	adminHandler.getDays);
router.post("/:adminID/schedules/:scheduleID/days",
	validateAdmin,
	adminHandler.postDay);
router.put("/:adminID/schedules/:scheduleID/days/:dayID",
	validateAdmin,
	adminHandler.putDay);
router.delete("/:adminID/schedules/:scheduleID/days/:dayID",
	validateAdmin,
	adminHandler.deleteDay);

router.get("/:adminID/schedules/:scheduleID/days/:dayID/hours",
	validateAdmin,
	adminHandler.getHours);

/* We perform hour collision prevention in this endpoint, that's why it's more 
 * complicated. */
router.post("/:adminID/schedules/:scheduleID/days/:dayID/hours",
	validateAdmin,
	adminHandler.findTeacherID,
	adminHandler.findDayIndex,
	adminHandler.findTeacherHours,
	adminHandler.postHour);

router.put("/:adminID/schedules/:scheduleID/days/:dayID/hours/:hourID",
	validateAdmin,
	adminHandler.findTeacherID,
	adminHandler.findDayIndex,
	adminHandler.findTeacherHours,
	adminHandler.putHour);

router.delete("/:adminID/schedules/:scheduleID/days/:dayID/hours/:hourID",
	validateAdmin,
	adminHandler.deleteHour);

/* ===================================================== */


module.exports = router;
