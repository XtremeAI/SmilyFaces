import React, { Component } from 'react';
import { Auth } from 'aws-amplify';
import { Form, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import LoaderButton from '../components/LoaderButton';
import './Signup.css';

export default class Signup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      confirmp: '',
      isLoading: false
    };
  }

  validateForm = () =>
    this.state.email.length > 0 &&
    this.state.password.length > 0 &&
    this.state.password === this.state.confirmp;

  hangleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };

  handleSubmit = async event => {
    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      await Auth.signUp({
        username: this.state.email,
        password: this.state.password
      });
      console.log('Signed up!');
      this.props.userHasAuthenticated(true);
      this.props.history.push('/');
    } catch (e) {
      console.log(e.message);
      this.setState({ isLoading: false });
    }
  };

  render() {
    return (
      <div className="Signup">
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
          <FormGroup controlId="confirmp" bsSize="large">
            <ControlLabel>Confirm Password</ControlLabel>
            <FormControl
              type="password"
              value={this.state.confirmp}
              onChange={this.hangleChange}
            />
          </FormGroup>
          <LoaderButton
            block
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            text="Signup"
            loadingText="Signing up..."
            isLoading={this.state.isLoading}
          />
        </Form>
      </div>
    );
  }
}
