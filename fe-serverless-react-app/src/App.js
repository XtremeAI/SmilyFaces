import React, { Component, Fragment } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap'
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import './App.css';
import Routes from './Routes';
import { Auth } from 'aws-amplify';


class App extends Component {
  constructor(props){
    super(props);
  
    this.state = {
      isAuthenticated: false,
      isAuthenticating: true,
      isAdmin: false,
      userName: ""
    }  
  }  
  
  async componentDidMount() {
    try {
      if (await Auth.currentSession()) {
        this.userHasAuthenticated(true);
      }
    } catch (e) {
      if (e !== "No current user") {
        alert(e);      
      }
    }
  
  }

  userHasAuthenticated = async (isAuthenticated) => {
    try {
      const currentUser = isAuthenticated ? await Auth.currentAuthenticatedUser() : null;
      
      this.setState({ 
        isAuthenticating: false,
        isAuthenticated: isAuthenticated,
        userName: currentUser ? currentUser.attributes.email : ""
      });  
    } catch (e) {
      console.log(e);
    }  
  }  
  
  handleLogout = async () => {
    try {
      await Auth.signOut();
      this.userHasAuthenticated(false);
      this.props.history.push("/login");
    } catch (e) {
      console.log(e.message);
    }  
  }  

  render() {
    const childProps = {
      isAuthenticating: this.state.isAuthenticating,
      isAuthenticated: this.state.isAuthenticated,
      userHasAuthenticated: this.userHasAuthenticated
    };

    return (
      this.state.isAuthenticating
      ? 'Loading...'
      : <div className="App container">
        <Navbar fluid collapseOnSelect className="App-navbar">
          <Navbar.Header>
            <Navbar.Brand className="App-brand">
              <Link to="/">Smily Faces</Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav pullRight>
              {this.state.isAuthenticated
                ? <NavItem onClick={this.handleLogout}>Logout {this.state.userName}</NavItem>
                : <Fragment>
                  {/* <LinkContainer to="/signup">
                    <NavItem>Signup</NavItem>
                  </LinkContainer> */}
                  <LinkContainer to="/login">
                    <NavItem>Login</NavItem>
                  </LinkContainer>
                </Fragment>
              }
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Routes childProps={childProps} />

      </div>
    );
  }
}

export default withRouter(App);
