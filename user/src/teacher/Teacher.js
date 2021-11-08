import React from 'react';
import { Redirect, Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import NavBar from './NavBar';
import Courses from './courses/Courses';
import Class from './Class';
import Home from './home/Home';
import Profile from './home/Profile';
import Schedule from './schedule/Schedule';

export const TeacherContext = React.createContext(0);

function Teacher() {
  let { id } = useParams();
  let match = useRouteMatch();
  return (
    <TeacherContext.Provider value={id}>
      <div className="TeacherPage">
        <NavBar />
        <main>
          <Switch>

            <Route exact path={`${match.path}/home`}>
              <Home teacherId={id} />
            </Route>

            <Route exact path={`${match.path}/home/profile`}>
              <Profile />
            </Route>

            <Route path={`${match.path}/class`}>
              <Class />
            </Route>

            <Route path={`${match.path}/courses`}>
              <Courses />
            </Route>

            <Route path={`${match.path}/schedule`}>
              <Schedule />
            </Route>

            <Route path={`${match.path}/`}>
              <Redirect to={`${match.url}/home`} />
            </Route>

          </Switch>
        </main>
      </div>
    </TeacherContext.Provider>
  );
}

export default Teacher;
