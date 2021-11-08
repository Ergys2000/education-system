import React, { useState, useEffect, useContext } from 'react';
import apiLink from '../../API';
import { TeacherContext } from '../Teacher';
import { organizeSchedule, fillMissingDays } from '../../Utils';
import Schedule, { Day, Hour } from '../../shared/Schedule';


const ScheduleDataProvider = () => {
	const teacherId = useContext(TeacherContext);
	/* This state and useEffect are used to get the list of days, along with
	 * their specific day hours for this schedule */
	const [days, setDays] = useState<Day[]>([]);
	useEffect(() => {
		const fetchDays = async () => {
			const token = sessionStorage.getItem("jwt");
			const bearer = 'Bearer ' + token;
			await fetch(`${apiLink}/teachers/${teacherId}/schedule`, {
				headers: {
					'Authorization': bearer
				}
			})
				.then(res => res.json())
				.then(res => {
					if (res.status === "OK") {
						/* From the api we get a list of hours, each hour has it's own day
						 * information, we use the function organizeSchedule to organize
						 * the hours into a list of days, each day with an array of hours */
						const organized_days = organizeSchedule(res.result) as any;

						/* If there are missing days add them (list of days is defined in the
						* definition of the 'fillMissingDays' function */
						fillMissingDays(organized_days);
						setDays(organized_days);
					} else {
						(alert as any)("Error", res.message, "error");
					}
				}).catch(_ => console.log(_));
		}

		fetchDays();
	}, [teacherId]);
	return (
		<>
			<Schedule days={days} />
		</>
	);
}

export default ScheduleDataProvider;
