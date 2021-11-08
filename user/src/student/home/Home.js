import React, { useContext }  from "react";
import Statistics from './Statistics';
import apiLink from "../../API";
import { StudentContext } from "../Student";
import Events from '../../shared/Events';

/* displays the home page */
function Home(_props) {
  const studentId = useContext(StudentContext);
	return (
		<div className="home">
			<header>
				<h2>Home</h2>
			</header>
			<section>
				<div className="dashboard">
					<div className="personal">
						<Statistics />
					</div>
					<Events eventsApiLink={`${apiLink}/students/${studentId}/events`} />
				</div>
			</section>
		</div>
	);
}

export default Home;
