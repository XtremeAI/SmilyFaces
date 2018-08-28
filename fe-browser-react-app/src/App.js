import React, { Component, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { Auth } from 'aws-amplify';

import Routes from './Routes';

import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isAuthenticated: false,
      isAuthenticating: true,
      isAdmin: false,
      userName: '',
      userRoles: []
    };
  }

  async componentDidMount() {
    try {
      const currentSession = await Auth.currentSession();
      if (currentSession) {
        this.userHasAuthenticated(true);
      }
    } catch (e) {
      if (e !== 'No current user') {
        alert(e);
      }
      this.setState({ isAuthenticating: false });
    }
  }

  userHasAuthenticated = async isAuthenticated => {
    try {
      const currentUser = isAuthenticated
        ? await Auth.currentAuthenticatedUser()
        : null;
      this.setState({
        isAuthenticating: false,
        isAuthenticated: isAuthenticated
      });
      if (currentUser) {
        const userRoles = currentUser.signInUserSession.idToken.payload[
          'cognito:groups'
        ]
          ? currentUser.signInUserSession.idToken.payload['cognito:groups']
          : [];
        this.setState({
          userName: currentUser.attributes.email,
          userRoles
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  handleLogout = async () => {
    try {
      await Auth.signOut();
      this.userHasAuthenticated(false);
      this.props.history.push('/login');
    } catch (e) {
      console.log(e.message);
    }
  };

  render() {
    const childProps = {
      isAuthenticating: this.state.isAuthenticating,
      isAuthenticated: this.state.isAuthenticated,
      userHasAuthenticated: this.userHasAuthenticated,
      userName: this.state.userName,
      userRoles: this.state.userRoles
    };

    const isAdmin = [...this.state.userRoles].includes('Admins');

    return this.state.isAuthenticating ? (
      'Loading...'
    ) : (
      <div className="App container">
        <Navbar fluid collapseOnSelect className="App-navbar">
          <Navbar.Header>
            <Navbar.Brand className="App-brand">
              <Link to="/">Smily Faces</Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav pullRight>
              {this.state.isAuthenticated ? (
                <Fragment>
                  {isAdmin && (
                    <LinkContainer to="/upload">
                      <NavItem>Upload</NavItem>
                    </LinkContainer>
                  )}
                  <LinkContainer to="/profile">
                    <NavItem>Profile</NavItem>
                  </LinkContainer>
                  <NavItem onClick={this.handleLogout}>Logout</NavItem>
                </Fragment>
              ) : (
                <Fragment>
                  <LinkContainer to="/login">
                    <NavItem>Login</NavItem>
                  </LinkContainer>
                  <LinkContainer to="/signup">
                    <NavItem>SignUp</NavItem>
                  </LinkContainer>
                </Fragment>
              )}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Helmet title="Smile" />
        <Routes childProps={childProps} />
      </div>
    );
  }
}

export default App;
