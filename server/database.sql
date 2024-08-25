-- --------------------------------------------------------
-- Host:                         localhost
-- Server version:               10.5.10-MariaDB-1:10.5.10+maria~focal - mariadb.org binary distribution
-- Server OS:                    debian-linux-gnu
-- HeidiSQL Version:             12.0.0.6468
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table education.admin
CREATE TABLE IF NOT EXISTS `admin` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `firstname` varchar(30) DEFAULT NULL,
  `lastname` varchar(30) DEFAULT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `access` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table education.admin: ~0 rows (approximately)
DELETE FROM `admin`;
INSERT INTO `admin` (`id`, `firstname`, `lastname`, `email`, `password`, `age`, `gender`, `access`) VALUES
	(1, 'ergys', 'ergys', 'name@gmail.com', 'password', 20, 'male', 'supervisor'),
	(5, 'ergys', 'rrjolli', 'rrjolligys@gmail.com', 'password', 22, 'male', 'supervisor');

-- Dumping structure for table education.assignment
CREATE TABLE IF NOT EXISTS `assignment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` varchar(1000) NOT NULL,
  `courseInstanceID` int(11) NOT NULL,
  `due` datetime NOT NULL,
  `releaseDate` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `courseInstanceID` (`courseInstanceID`),
  CONSTRAINT `assignment_ibfk_1` FOREIGN KEY (`courseInstanceID`) REFERENCES `course_registration` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table education.assignment: ~0 rows (approximately)
DELETE FROM `assignment`;
INSERT INTO `assignment` (`id`, `title`, `description`, `courseInstanceID`, `due`, `releaseDate`) VALUES
	(18, 'Homework 1', 'Finish these', 65, '2024-08-23 13:45:00', '2024-08-19 13:45:00');

-- Dumping structure for table education.class
CREATE TABLE IF NOT EXISTS `class` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(40) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table education.class: ~0 rows (approximately)
DELETE FROM `class`;
INSERT INTO `class` (`id`, `name`) VALUES
	(13, 'Computer engineering 1');

-- Dumping structure for table education.class_instance
CREATE TABLE IF NOT EXISTS `class_instance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `year` int(11) NOT NULL,
  `classID` int(11) NOT NULL,
  `scheduleID` int(11) DEFAULT NULL,
  `teacherID` int(11) DEFAULT NULL,
  `name` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `classID` (`classID`),
  KEY `scheduleID` (`scheduleID`),
  KEY `advisor_fk` (`teacherID`),
  CONSTRAINT `advisor_fk` FOREIGN KEY (`teacherID`) REFERENCES `teacher` (`id`),
  CONSTRAINT `class_instance_ibfk_1` FOREIGN KEY (`classID`) REFERENCES `class` (`id`),
  CONSTRAINT `schedule_fk` FOREIGN KEY (`scheduleID`) REFERENCES `schedule` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table education.class_instance: ~0 rows (approximately)
DELETE FROM `class_instance`;
INSERT INTO `class_instance` (`id`, `year`, `classID`, `scheduleID`, `teacherID`, `name`) VALUES
	(23, 2022, 13, 23, 12, 'Computer engineering 1 - 2022');

-- Dumping structure for table education.course
CREATE TABLE IF NOT EXISTS `course` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(40) NOT NULL,
  `category` varchar(25) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table education.course: ~0 rows (approximately)
DELETE FROM `course`;
INSERT INTO `course` (`id`, `name`, `category`) VALUES
	(21, 'Calculus 1', 'Mathematics');

-- Dumping structure for table education.course_registration
CREATE TABLE IF NOT EXISTS `course_registration` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `classInstanceID` int(11) NOT NULL,
  `courseID` int(11) NOT NULL,
  `teacherID` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_course` (`classInstanceID`,`courseID`),
  KEY `courseID` (`courseID`),
  KEY `teacher_fk` (`teacherID`),
  CONSTRAINT `course_registration_ibfk_1` FOREIGN KEY (`classInstanceID`) REFERENCES `class_instance` (`id`) ON DELETE CASCADE,
  CONSTRAINT `course_registration_ibfk_2` FOREIGN KEY (`courseID`) REFERENCES `course` (`id`),
  CONSTRAINT `teacher_fk` FOREIGN KEY (`teacherID`) REFERENCES `teacher` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table education.course_registration: ~0 rows (approximately)
DELETE FROM `course_registration`;
INSERT INTO `course_registration` (`id`, `classInstanceID`, `courseID`, `teacherID`) VALUES
	(65, 23, 21, 12);

-- Dumping structure for table education.day_hours
CREATE TABLE IF NOT EXISTS `day_hours` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dayID` int(11) NOT NULL,
  `courseInstanceID` int(11) NOT NULL,
  `start` time NOT NULL,
  `end` time NOT NULL,
  PRIMARY KEY (`id`),
  KEY `day_fk` (`dayID`),
  KEY `courseInstanceID` (`courseInstanceID`),
  CONSTRAINT `day_fk` FOREIGN KEY (`dayID`) REFERENCES `schedule_day` (`id`) ON DELETE CASCADE,
  CONSTRAINT `day_hours_ibfk_1` FOREIGN KEY (`courseInstanceID`) REFERENCES `course_registration` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=99 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table education.day_hours: ~0 rows (approximately)
DELETE FROM `day_hours`;
INSERT INTO `day_hours` (`id`, `dayID`, `courseInstanceID`, `start`, `end`) VALUES
	(97, 59, 65, '10:00:00', '10:50:00'),
	(98, 60, 65, '16:30:00', '17:30:00');

-- Dumping structure for table education.event
CREATE TABLE IF NOT EXISTS `event` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(50) NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `classInstanceID` int(11) DEFAULT NULL,
  `due` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `classInstanceID` (`classInstanceID`),
  CONSTRAINT `event_ibfk_1` FOREIGN KEY (`classInstanceID`) REFERENCES `class_instance` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table education.event: ~0 rows (approximately)
DELETE FROM `event`;

-- Dumping structure for table education.event_image
CREATE TABLE IF NOT EXISTS `event_image` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `filename` varchar(50) NOT NULL,
  `eventID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `eventID` (`eventID`),
  CONSTRAINT `event_image_ibfk_1` FOREIGN KEY (`eventID`) REFERENCES `event` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table education.event_image: ~0 rows (approximately)
DELETE FROM `event_image`;

-- Dumping structure for table education.grade
CREATE TABLE IF NOT EXISTS `grade` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `studentID` int(11) NOT NULL,
  `grade` int(11) NOT NULL,
  `date` date DEFAULT NULL,
  `courseInstanceID` int(11) NOT NULL,
  `comment` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `studentID` (`studentID`),
  KEY `grade_ibfk_2` (`courseInstanceID`),
  CONSTRAINT `grade_ibfk_1` FOREIGN KEY (`studentID`) REFERENCES `student` (`id`) ON DELETE CASCADE,
  CONSTRAINT `grade_ibfk_2` FOREIGN KEY (`courseInstanceID`) REFERENCES `course_registration` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table education.grade: ~0 rows (approximately)
DELETE FROM `grade`;
INSERT INTO `grade` (`id`, `studentID`, `grade`, `date`, `courseInstanceID`, `comment`) VALUES
	(65, 20, 9, '2024-08-20', 65, 'Grades for Homework 1');

-- Dumping structure for table education.jwt_token
CREATE TABLE IF NOT EXISTS `jwt_token` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userID` int(11) NOT NULL,
  `type` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user` (`userID`,`type`)
) ENGINE=InnoDB AUTO_INCREMENT=664 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table education.jwt_token: ~4 rows (approximately)
DELETE FROM `jwt_token`;
INSERT INTO `jwt_token` (`id`, `userID`, `type`) VALUES
	(659, 1, 'admin'),
	(662, 5, 'admin'),
	(663, 12, 'teacher'),
	(661, 20, 'student');

-- Dumping structure for table education.parent
CREATE TABLE IF NOT EXISTS `parent` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `firstname` varchar(30) NOT NULL,
  `lastname` varchar(30) NOT NULL,
  `email` varchar(30) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `nationality` varchar(20) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dumping data for table education.parent: ~0 rows (approximately)
DELETE FROM `parent`;

-- Dumping structure for table education.post
CREATE TABLE IF NOT EXISTS `post` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `posted_on` datetime NOT NULL,
  `courseInstanceID` int(11) NOT NULL,
  `teacherID` int(11) DEFAULT NULL,
  `studentID` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `post_fk2` (`courseInstanceID`),
  KEY `teacherID` (`teacherID`),
  KEY `studentID` (`studentID`),
  CONSTRAINT `post_fk2` FOREIGN KEY (`courseInstanceID`) REFERENCES `course_registration` (`id`) ON DELETE CASCADE,
  CONSTRAINT `post_ibfk_1` FOREIGN KEY (`teacherID`) REFERENCES `teacher` (`id`) ON DELETE CASCADE,
  CONSTRAINT `post_ibfk_2` FOREIGN KEY (`studentID`) REFERENCES `student` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table education.post: ~0 rows (approximately)
DELETE FROM `post`;
INSERT INTO `post` (`id`, `title`, `posted_on`, `courseInstanceID`, `teacherID`, `studentID`) VALUES
	(55, 'Notification', '2024-08-20 11:37:44', 65, 12, NULL);

-- Dumping structure for table education.post_body
CREATE TABLE IF NOT EXISTS `post_body` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `postID` int(11) NOT NULL,
  `body` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `postID` (`postID`),
  CONSTRAINT `postID` FOREIGN KEY (`postID`) REFERENCES `post` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table education.post_body: ~0 rows (approximately)
DELETE FROM `post_body`;
INSERT INTO `post_body` (`id`, `postID`, `body`) VALUES
	(58, 55, 'make sure you prepare for the test on monday');

-- Dumping structure for table education.post_comment
CREATE TABLE IF NOT EXISTS `post_comment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `comment` varchar(1500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `postID` int(11) NOT NULL,
  `commented_on` datetime DEFAULT NULL,
  `studentID` int(11) DEFAULT NULL,
  `teacherID` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `postID` (`postID`),
  KEY `teacherID` (`teacherID`),
  KEY `studentID` (`studentID`),
  CONSTRAINT `post_comment_ibfk_1` FOREIGN KEY (`postID`) REFERENCES `post` (`id`) ON DELETE CASCADE,
  CONSTRAINT `post_comment_ibfk_2` FOREIGN KEY (`teacherID`) REFERENCES `teacher` (`id`) ON DELETE CASCADE,
  CONSTRAINT `post_comment_ibfk_3` FOREIGN KEY (`studentID`) REFERENCES `student` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table education.post_comment: ~0 rows (approximately)
DELETE FROM `post_comment`;
INSERT INTO `post_comment` (`id`, `comment`, `postID`, `commented_on`, `studentID`, `teacherID`) VALUES
	(37, 'This is a comment to a post', 55, '2024-08-20 11:37:57', NULL, 12);

-- Dumping structure for table education.register
CREATE TABLE IF NOT EXISTS `register` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mark` varchar(1) NOT NULL,
  `comment` varchar(100) DEFAULT NULL,
  `date` date NOT NULL,
  `studentID` int(11) NOT NULL,
  `courseInstanceID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `studentID` (`studentID`,`courseInstanceID`,`date`),
  KEY `courseInstanceID` (`courseInstanceID`),
  CONSTRAINT `register_ibfk_1` FOREIGN KEY (`studentID`) REFERENCES `student` (`id`) ON DELETE CASCADE,
  CONSTRAINT `register_ibfk_2` FOREIGN KEY (`courseInstanceID`) REFERENCES `course_registration` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table education.register: ~0 rows (approximately)
DELETE FROM `register`;
INSERT INTO `register` (`id`, `mark`, `comment`, `date`, `studentID`, `courseInstanceID`) VALUES
	(31, '3', 'behaved badly', '2024-08-14', 20, 65);

-- Dumping structure for table education.schedule
CREATE TABLE IF NOT EXISTS `schedule` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table education.schedule: ~0 rows (approximately)
DELETE FROM `schedule`;
INSERT INTO `schedule` (`id`, `name`) VALUES
	(23, 'Computer Engineering 1');

-- Dumping structure for table education.schedule_day
CREATE TABLE IF NOT EXISTS `schedule_day` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `scheduleID` int(11) NOT NULL,
  `name` varchar(20) DEFAULT NULL,
  `day` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_day_nr` (`scheduleID`,`day`),
  CONSTRAINT `schedule_day_ibfk_1` FOREIGN KEY (`scheduleID`) REFERENCES `schedule` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table education.schedule_day: ~5 rows (approximately)
DELETE FROM `schedule_day`;
INSERT INTO `schedule_day` (`id`, `scheduleID`, `name`, `day`) VALUES
	(58, 23, 'Monday', 1),
	(59, 23, 'Tuesday', 2),
	(60, 23, 'Wednesday', 3),
	(61, 23, 'Thursday', 4),
	(62, 23, 'Friday', 5);

-- Dumping structure for table education.session
CREATE TABLE IF NOT EXISTS `session` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `topic` varchar(50) DEFAULT NULL,
  `type` varchar(30) DEFAULT NULL,
  `week` int(11) NOT NULL,
  `length` int(11) NOT NULL,
  `courseInstanceID` int(11) NOT NULL,
  `date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `courseInstanceID` (`courseInstanceID`),
  CONSTRAINT `session_ibfk_1` FOREIGN KEY (`courseInstanceID`) REFERENCES `course_registration` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table education.session: ~0 rows (approximately)
DELETE FROM `session`;

-- Dumping structure for table education.session_attendance
CREATE TABLE IF NOT EXISTS `session_attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `length` int(11) NOT NULL,
  `sessionID` int(11) NOT NULL,
  `studentID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_student` (`studentID`,`sessionID`),
  KEY `sessionID` (`sessionID`),
  CONSTRAINT `session_attendance_ibfk_1` FOREIGN KEY (`sessionID`) REFERENCES `session` (`id`) ON DELETE CASCADE,
  CONSTRAINT `session_attendance_ibfk_2` FOREIGN KEY (`studentID`) REFERENCES `student` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table education.session_attendance: ~0 rows (approximately)
DELETE FROM `session_attendance`;

-- Dumping structure for table education.shared_file
CREATE TABLE IF NOT EXISTS `shared_file` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `filename` varchar(100) NOT NULL,
  `courseInstanceID` int(11) NOT NULL,
  `assignmentID` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `courseInstanceID_fk` (`courseInstanceID`),
  KEY `assignmentID` (`assignmentID`),
  CONSTRAINT `courseInstanceID_fk` FOREIGN KEY (`courseInstanceID`) REFERENCES `course_registration` (`id`) ON DELETE CASCADE,
  CONSTRAINT `shared_file_ibfk_1` FOREIGN KEY (`assignmentID`) REFERENCES `assignment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table education.shared_file: ~0 rows (approximately)
DELETE FROM `shared_file`;

-- Dumping structure for table education.student
CREATE TABLE IF NOT EXISTS `student` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `password` varchar(30) NOT NULL,
  `firstname` varchar(30) NOT NULL,
  `lastname` varchar(30) NOT NULL,
  `email` varchar(30) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `nationality` varchar(20) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `schoolYear` int(11) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `parentID` int(11) DEFAULT NULL,
  `classInstanceID` int(11) NOT NULL,
  `address` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_constraint` (`email`),
  KEY `parentID` (`parentID`),
  KEY `classInstanceID` (`classInstanceID`),
  CONSTRAINT `student_ibfk_1` FOREIGN KEY (`parentID`) REFERENCES `parent` (`id`),
  CONSTRAINT `student_ibfk_2` FOREIGN KEY (`classInstanceID`) REFERENCES `class_instance` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table education.student: ~0 rows (approximately)
DELETE FROM `student`;
INSERT INTO `student` (`id`, `password`, `firstname`, `lastname`, `email`, `phone`, `nationality`, `age`, `schoolYear`, `gender`, `parentID`, `classInstanceID`, `address`) VALUES
	(20, 'password', 'Ergys', 'Rrjolli', 'rrjolligys@gmail.com', '068937290', 'Albania', 18, NULL, 'male', NULL, 23, 'adress');

-- Dumping structure for table education.student_file
CREATE TABLE IF NOT EXISTS `student_file` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `filename` varchar(100) NOT NULL,
  `studentID` int(11) NOT NULL,
  `courseInstanceID` int(11) NOT NULL,
  `assignmentID` int(11) DEFAULT NULL,
  `posted_on` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `studentID` (`studentID`),
  KEY `courseInstanceID` (`courseInstanceID`),
  KEY `assignmentID` (`assignmentID`),
  CONSTRAINT `courseInstanceID` FOREIGN KEY (`courseInstanceID`) REFERENCES `course_registration` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_file_ibfk_1` FOREIGN KEY (`studentID`) REFERENCES `student` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_file_ibfk_2` FOREIGN KEY (`assignmentID`) REFERENCES `assignment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table education.student_file: ~0 rows (approximately)
DELETE FROM `student_file`;
INSERT INTO `student_file` (`id`, `filename`, `studentID`, `courseInstanceID`, `assignmentID`, `posted_on`) VALUES
	(65, 'message-1724154374431.txt', 20, 65, 18, '2024-08-20 11:46:14');

-- Dumping structure for table education.teacher
CREATE TABLE IF NOT EXISTS `teacher` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `password` varchar(30) NOT NULL,
  `firstname` varchar(30) NOT NULL,
  `lastname` varchar(30) NOT NULL,
  `email` varchar(30) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `nationality` varchar(30) DEFAULT NULL,
  `address` varchar(50) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table education.teacher: ~1 rows (approximately)
DELETE FROM `teacher`;
INSERT INTO `teacher` (`id`, `password`, `firstname`, `lastname`, `email`, `phone`, `nationality`, `address`, `age`, `gender`) VALUES
	(12, 'password', 'Teacher', 'Teacher', 'teacher1@gmail.com', '0681923012', 'Albania', 'Tirane', 45, 'male');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
