-- MariaDB dump 10.19  Distrib 10.5.9-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: education
-- ------------------------------------------------------
-- Server version	10.5.9-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin` (
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES (1,'ergys','ergys','name@gmail.com','password',20,'male','supervisor');
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignment`
--

DROP TABLE IF EXISTS `assignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `assignment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` varchar(1000) NOT NULL,
  `courseInstanceID` int(11) NOT NULL,
  `due` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `courseInstanceID` (`courseInstanceID`),
  CONSTRAINT `assignment_ibfk_1` FOREIGN KEY (`courseInstanceID`) REFERENCES `course_registration` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `class`
--

DROP TABLE IF EXISTS `class`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(40) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `class_instance`
--

DROP TABLE IF EXISTS `class_instance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_instance` (
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
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_instance`
--

--
-- Table structure for table `course`
--

DROP TABLE IF EXISTS `course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `course` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(40) NOT NULL,
  `category` varchar(25) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course`
--

--
-- Table structure for table `course_registration`
--

DROP TABLE IF EXISTS `course_registration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `course_registration` (
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
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_registration`
--

--
-- Table structure for table `day_hours`
--

DROP TABLE IF EXISTS `day_hours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `day_hours` (
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
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `day_hours`
--

--
-- Table structure for table `event`
--

DROP TABLE IF EXISTS `event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `event` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(50) NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `classInstanceID` int(11) DEFAULT NULL,
  `due` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `classInstanceID` (`classInstanceID`),
  CONSTRAINT `event_ibfk_1` FOREIGN KEY (`classInstanceID`) REFERENCES `class_instance` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event`
--

--
-- Table structure for table `event_image`
--

DROP TABLE IF EXISTS `event_image`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `event_image` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `filename` varchar(50) NOT NULL,
  `eventID` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `eventID` (`eventID`),
  CONSTRAINT `event_image_ibfk_1` FOREIGN KEY (`eventID`) REFERENCES `event` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_image`
--

--
-- Table structure for table `grade`
--

DROP TABLE IF EXISTS `grade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `grade` (
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
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grade`
--

--
-- Table structure for table `jwt_token`
--

DROP TABLE IF EXISTS `jwt_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jwt_token` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userID` int(11) NOT NULL,
  `type` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user` (`userID`,`type`)
) ENGINE=InnoDB AUTO_INCREMENT=657 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jwt_token`
--

--
-- Table structure for table `parent`
--

DROP TABLE IF EXISTS `parent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parent` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parent`
--

--
-- Table structure for table `post`
--

DROP TABLE IF EXISTS `post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `post` (
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
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post`
--

--
-- Table structure for table `post_body`
--

DROP TABLE IF EXISTS `post_body`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `post_body` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `postID` int(11) NOT NULL,
  `body` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `postID` (`postID`),
  CONSTRAINT `postID` FOREIGN KEY (`postID`) REFERENCES `post` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_body`
--

--
-- Table structure for table `post_comment`
--

DROP TABLE IF EXISTS `post_comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `post_comment` (
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
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_comment`
--

--
-- Table structure for table `register`
--

DROP TABLE IF EXISTS `register`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `register` (
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
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `register`
--

--
-- Table structure for table `schedule`
--

DROP TABLE IF EXISTS `schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `schedule` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule`
--

--
-- Table structure for table `schedule_day`
--

DROP TABLE IF EXISTS `schedule_day`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `schedule_day` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `scheduleID` int(11) NOT NULL,
  `name` varchar(20) DEFAULT NULL,
  `day` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_day_nr` (`scheduleID`,`day`),
  CONSTRAINT `schedule_day_ibfk_1` FOREIGN KEY (`scheduleID`) REFERENCES `schedule` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule_day`
--

--
-- Table structure for table `session`
--

DROP TABLE IF EXISTS `session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `session` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session`
--

--
-- Table structure for table `session_attendance`
--

DROP TABLE IF EXISTS `session_attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `session_attendance` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session_attendance`
--

--
-- Table structure for table `shared_file`
--

DROP TABLE IF EXISTS `shared_file`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `shared_file` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shared_file`
--

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student` (
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
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student`
--

--
-- Table structure for table `student_file`
--

DROP TABLE IF EXISTS `student_file`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `student_file` (
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
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_file`
--

--
-- Table structure for table `teacher`
--

DROP TABLE IF EXISTS `teacher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `teacher` (
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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher`
--

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-05-18 17:13:46
