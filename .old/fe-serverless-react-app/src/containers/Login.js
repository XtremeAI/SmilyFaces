import React, { Component } from 'react'
import { Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import { Auth } from 'aws-amplify'
import './Login.css';
import LoaderButton from '../components/LoaderButton';


export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      isLoading: false
    };
  }

  validateForm = () => this.state.email.length > 0 && this.state.password.length > 0

  hangleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = async event => {
    event.preventDefault();

    this.setState({isLoading: true});
    
    try {
      await Auth.signIn(this.state.email, this.state.password); // returns CongnitoUser 
      this.props.userHasAuthenticated(true);
      console.log("Logged in!");
      this.props.history.push("/");
    } catch (e) {
      console.log(e.message);
      this.setState({ isLoading: false });
    }
  }

  render() {
    return (
      <div className="Login">
        <Form onSubmit={this.handleSubmit}>
          <FormGroup controlId="email" bsSize="large">
            <ControlLabel>Email</ControlLabel>
            <FormControl
              autoFocus
              type="email"
              value={this.state.email}
              onChange={this.hangleChange}
            />
          </FormGroup>
          <FormGroup controlId="password" bsSize="large">
            <ControlLabel>Password</ControlLabel>
            <FormControl
              type="password"
              value={this.state.password}
              onChange={this.hangleChange}
            />
          </FormGroup>
          <LoaderButton
            block
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            text="Login"
            loadingText="Logging in..."
            isLoading={this.state.isLoading}
          >
          </LoaderButton>
        </Form>
      </div>
    )
  }
}
