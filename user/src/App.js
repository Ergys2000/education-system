import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Login from './login/Login';
import './styles/App.scss';
import Student from './student/Student';
import Teacher from './teacher/Teacher';

/* Set the alert function to execute a sweet alert */
import swal from 'sweetalert';
if (document.getElementById) {
  window.alert = (title, text, type) => {
		if(text === "jwt expired") {
			window.location.replace('/');
		} else {
			swal({ title: title, text: text, icon: type });
		}
  };
}

function App(props) {
  return (
    <div className="app">
      <Router>
        <Switch>
          <Route exact path="/">
            <Login />
          </Route>

          <Route path="/s/:id">
            <Student />
          </Route>

          <Route path="/t/:id">
            <Teacher />
          </Route>

        </Switch>
      </Router>
    </div>
  );
}

export default App;
