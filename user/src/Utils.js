/* Regex validation functions */
const validateEmail = (string) => {
	const regex = /^\S+@\S+\.\S+$/;
	return regex.test(string);
};
const validateNameString = (string) => {
	const regex = /^[a-zA-z]{0,30}$/;
	return regex.test(string);
};
const validatePhone = (string) => {
	const regex = /^\+?\d{10,14}$/;
	return regex.test(string);
};

/* This function converts a date string into a human readable date string */
const convertDateString = (date) => {
	let dateObject = new Date(date);
	const time = dateObject.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
	return `${time}, ${dateObject.toDateString()}`;
}

/*
 * this function that organizes the schedule into day specific
 * hours, so  that they are easier to display
*/
const organizeSchedule = (schedule_data) => {
	let result = []; // the final result
	// dayIndex tells us on which day we are inserting
	// hourIndex tells us on which hour we are inserting
	let currDayIndex = -1, currHourIndex = 0;

	// lastDayName represents the name of the last day we were adding into
	// we use it to determine when we need to insert hours into another day
	let lastDayName = "";

	for (let i = 0; i < schedule_data.length; i++) {

		let row = schedule_data[i];

		// if the day name has changed
		if (lastDayName !== row.day_name) {
			// modify and increment the variables
			lastDayName = row.day_name;
			currDayIndex++;
			currHourIndex = 0;
			// initialize the day object in the correct index
			result[currDayIndex] = { name: lastDayName, hours: [], day: row.day };
		}

		result[currDayIndex].hours[currHourIndex] = {
			id: row.id,
      start: row.start,
      end: row.end,
			course_name: row.course_name,
			course_category: row.course_category,
			courseInstanceID: row.courseInstanceID
		};

		currHourIndex++;
	}
	return result;
};


/* This functions mutates an array of days, such that at least 5 days are
* included in that array */
const defaultDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const fillMissingDays = (days) => {
	/* This is the id that will be used when a filler day is inserted */
	let newId = days[days.length - 1].id + 1;

	/* Loop through all of the default days */
	defaultDays.forEach((name, index) => {
		/* If a day exists at that index */
		if (days[index]) {
			/* If the day in the array has a day number which is not equal
			* to the correct day number of the day in that index,
			* In other words there is a Tuesday, where a Monday should be. */
			if (days[index].day != index + 1) {
				/* Add the new day */
				const newDay = {
					id: newId,
					name: name,
					hours: [],
					day: index + 1
				};
				newId += 1;
				days.splice(index, 0, newDay);
			}
		} else { /* There is no day at that index, so just add a new one */
			const newDay = {
				id: newId,
				name: name,
				hours: [],
				day: index + 1
			};

			newId += 1;
			days.splice(index, 0, newDay);
		}
	});
}

/* this function organizes grades that come from the api into student specific
 * grades so that they are easier to display */
const organizeGrades = (grades) => {
	// the final result
	let result = [];
	// helps us determine if the grades have changed
	let lastStudentId = -1;
	// holds the current position in terms of student count
	let currPosition = -1;

	// for each grade in the list
	for (let i = 0; i < grades.length; i++) {
		// extract the current grade
		const currGrade = grades[i];
		// get only the neccessary information
		const grade = {
			id: currGrade.id,
			grade: currGrade.grade,
			comment: currGrade.comment,
			date: currGrade.date
		};
		// if the student id has changed
		if (lastStudentId !== currGrade.studentID) {
			// increment the counter to point to the other student
			currPosition++;
			lastStudentId = currGrade.studentID;
			// create the other student entry
			result[currPosition] = {
				id: currGrade.studentID,
				firstname: currGrade.firstname,
				lastname: currGrade.lastname,
				grades: []
			};
		}
		result[currPosition].grades.push(grade);
	}
	return result;
};

/* organizes the list of files received from the api 
 * into a list of student objects, each containing a list of files
 * */
const organizeStudents = (studentFiles) => {
	const result = [];/* The final result */
	/* Keeps track of the current student id */
	let lastStudentId = -1;
	/* Keeps track of the current student index */
	let currStudent = -1;
	for (let i = 0; i < studentFiles.length; i++) {
		const studentFile = studentFiles[i];

		/* If the file belongs to a new student this means that
		 * we now have to create a new student object*/
		if (studentFile.studentID !== lastStudentId) {
			lastStudentId = studentFile.studentID;
			currStudent++;
			result[currStudent] = {
				id: studentFile.studentID,
				firstname: studentFile.firstname,
				lastname: studentFile.lastname,
				files: []
			};
		}

		result[currStudent].files.push(studentFile);
	}
	return result;
};

/* The colors used by the schedule to automatically color different courses */
const scheduleColors = ['#eb506f', '#7e50eb', '#50ebb2', '#50eb55', '#d9eb50'];
const getColorForCourse = (courseId) => {
  const colorIndex = courseId % scheduleColors.length;
  return scheduleColors[colorIndex];
};

export {
	validateEmail, 
	validateNameString, 
	validatePhone,
	organizeSchedule,
	organizeGrades,
	organizeStudents,
  getColorForCourse,
	fillMissingDays,
	convertDateString
};
