import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from './containers/Home';
import Login from './containers/Login';
import Signup from './containers/Signup';
import AuthenticatedRoute from './components/AuthenticatedRoute';
import UnauthenticatedRoute from './components/UnauthenticatedRoute';

const NotFound = () => <h3>Sorry, the page is not found!</h3>;

export default ({ childProps }) => (
  <Switch>
    <AuthenticatedRoute path="/" exact component={Home} cProps={childProps} />
    <UnauthenticatedRoute
      path="/login"
      exact
      component={Login}
      cProps={childProps}
    />
    <UnauthenticatedRoute
      path="/signup"
      exact
      component={Signup}
      cProps={childProps}
    />
    <Route component={NotFound} />
  </Switch>
);
