import React from 'react';
import { Route, Switch, Redirect, useParams, useRouteMatch } from 'react-router-dom';
import NavBar from './NavBar';
import Home from './home/Home';
import Courses from './courses/Courses';
import Profile from './settings/Profile';
import Schedule from './schedule/Schedule';
import Settings from './settings/Settings';

export const StudentContext = React.createContext(null);

/* Displays the full student page */
function Student() {
	/* The student id */
  const { id } = useParams();
  const { url, path } = useRouteMatch();

  return (
    <StudentContext.Provider value={id}>
      <div className="StudentPage">
        <NavBar />
        <main>
          <Switch>
            <Route path={`${path}/courses`}>
              <Courses />
            </Route>

            <Route exact path={`${path}/`}>
              <Redirect to={`${url}/home`} />
            </Route>

            <Route exact path={`${path}/home`}>
              <Home />
            </Route>

            <Route exact path={`${path}/schedule`}>
              <Schedule />
            </Route>

            <Route exact path={`${path}/settings`}>
              <Settings />
            </Route>

            <Route exact path={`${path}/settings/profile`}>
              <Profile />
            </Route>

          </Switch>
        </main>
      </div>
    </StudentContext.Provider>
  );
}


export default Student;
