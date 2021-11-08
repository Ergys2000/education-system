export interface Course {
	id: number
	course_name: string
	firstname: string/* The first name of the teacher */
	lastname: string/* The lastname of the teacher */
	class_name: string
}

export interface Day {
	id: number
	day: number
	scheduleID: number
	name: string
}

export interface Hour {
	id: number
	dayID: number
	course_name: string
	start: string
	end: string
	courseInstanceID: number
}

/* These settings are used to scale the schedule properly
 * Hour and block settings depend on these*/
export const ScheduleSettings = {
	pixelPerMinute: 2,
	dayWidth: 200
};

/* Utility function used to calculate length between two times, e.g:("8:45")
 * Params:
 *  - start: string -- defines the start time,
 *  - end: string -- defines the end time
 * Returns:
 *  - length: number -- the length of the distance between the two times
 * */
export const calculateLength = (start: string, end: string): number => {
	const [s_h, s_m] = start.split(":");
	const [e_h, e_m] = end.split(":");
	const interval_length = (parseInt(e_h) - parseInt(s_h)) * 60
		+ (parseInt(e_m) - parseInt(s_m));
	return interval_length;
}

export const days = [
  {
    name: "Monday",
    day_index: 1
  },
  {
    name: "Tuesday",
    day_index: 2
  },
  {
    name: "Wednesday",
    day_index: 3
  },
  {
    name: "Thursday",
    day_index: 4
  },
  {
    name: "Friday",
    day_index: 5
  },
  {
    name: "Saturday",
    day_index: 6
  },
  {
    name: "Sunday",
    day_index: 7
  },
];
