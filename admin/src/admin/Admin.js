import React from 'react';
import { Redirect, Route, Switch, useParams, useRouteMatch } from 'react-router-dom';
import NavBar from './NavBar';
import Classes from './Classes';
import Teachers from './Teachers';
import Students from './Students';
import Admins from './Admins';
import Courses from './Courses';
import Events from './Events';
import Schedules from './Schedules';
import Home from './Home';

export const AdminContext = React.createContext(0);

function Admin() {
  const { id } = useParams();
  const { path, url } = useRouteMatch();


  return (
    <AdminContext.Provider value={id}>
      <div className="AdminPage">
        <NavBar />
        <Switch>
          <Route path={`${path}/home`}>
            <Home id={id} />
          </Route>
          <Route path={`${path}/classes`}>
            <Classes adminId={id} />
          </Route>
          <Route path={`${path}/teachers`}>
            <Teachers />
          </Route>
          <Route path={`${path}/students`}>
            <Students />
          </Route>
          <Route path={`${path}/admins`}>
            <Admins />
          </Route>
          <Route path={`${path}/courses`}>
            <Courses />
          </Route>
          <Route path={`${path}/events`}>
            <Events />
          </Route>
          <Route path={`${path}/schedules`}>
            <Schedules />
          </Route>
          <Route path={`${path}/`}>
            <Redirect to={`${url}/home`} />
          </Route>
        </Switch>
      </div>
    </AdminContext.Provider>
  );

}

export default Admin;
