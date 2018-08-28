import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from './containers/Home';
import Upload from './containers/Upload';
import Profile from './containers/Profile';
import Login from './containers/Login';
import Signup from './containers/Signup';
import AppliedRoute from './components/AppliedRoute';
import AuthenticatedRoute from './components/AuthenticatedRoute';
import UnauthenticatedRoute from './components/UnauthenticatedRoute';

const NotFound = () => <h3>Sorry, the page is not found!</h3>;

export default ({ childProps }) => (
  <Switch>
    <AppliedRoute path="/" exact component={Home} cProps={childProps} />
    <AuthenticatedRoute
      path="/upload"
      exact
      component={Upload}
      cProps={childProps}
    />
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
    <AuthenticatedRoute
      path="/profile"
      exact
      component={Profile}
      cProps={childProps}
    />
    <Route component={NotFound} />
  </Switch>
);
