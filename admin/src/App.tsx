import React from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import Login from './login/Login';
import Admini from './admin/Admin';
import './styles/App.scss';

const App = (_props: any) => {
	return (
		<div className="app">
			<Router>
				<Switch>
					<Route exact path="/">
						<Login />
					</Route>
					<Route path="/:id">
						<Admini />
					</Route>
				</Switch>
			</Router>
		</div>
	);
}

export default App;
