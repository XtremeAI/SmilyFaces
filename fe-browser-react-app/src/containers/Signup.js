import React, { Component } from 'react';
import { Auth } from 'aws-amplify';
import {
  Form,
  FormGroup,
  ControlLabel,
  FormControl,
  HelpBlock
} from 'react-bootstrap';
import LoaderButton from '../components/LoaderButton';
import './Signup.css';

export default class Signup extends Component {
  static defaultProps = {
    authData: {},
    authState: 'signUp',
    onAuthStateChange: (next, data) => {
      console.log(
        `SignUp:onAuthStateChange(${next}, ${JSON.stringify(data, null, 2)})`
      );
    }
  };

  constructor(props) {
    super(props);

    this.state = {
      authData: this.props.authData,
      authState: this.props.authState,
      modalShowing: false,
      error: null,
      isLoading: false,
      email: '',
      password: '',
      confirmPassword: '',
      confirmationCode: '',
      newUser: null
    };
  }

  validateForm = () =>
    this.state.email.length > 0 &&
    this.state.password.length > 0 &&
    this.state.password === this.state.confirmPassword;

  validateConfirmationForm = () => {
    return this.state.confirmationCode.length > 0;
  };

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };

  handleSubmit = async event => {
    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      const response = await Auth.signUp({
        username: this.state.email,
        password: this.state.password
      });
      console.log(
        `SignUp::onSignUp(): Response#1 = ${JSON.stringify(response, null, 2)}`
      );
      if (response.userConfirmed === false) {
        this.setState({
          authData: response,
          modalShowing: true,
          isLoading: false
        });
      } else {
        this.onAuthStateChange('default', { username: response.username });
      }
    } catch (e) {
      console.log(`SignUp::onSignUp(): Error ${JSON.stringify(e, null, 2)}`);
      this.setState({ error: e.message, isLoading: false });
    }
  };

  handleConfirmationSubmit = async event => {
    event.preventDefault();

    try {
      this.setState({ isLoading: true });

      const response = await Auth.confirmSignUp(
        this.state.email,
        this.state.confirmationCode
      );
      console.log(
        `SignUp::onConfirmSubmitted(): Response#2 = ${JSON.stringify(
          response,
          null,
          2
        )}`
      );
      this.setState({ loading: false });
      if (response === 'SUCCESS') {
        this.props.onAuthStateChange('default', { username: this.state.email });
        await Auth.signIn(this.state.email, this.state.password);

        this.props.userHasAuthenticated(true);
        this.props.history.push('/');
      }
    } catch (e) {
      console.log(
        `SignUp::onConfirmSubmitted(): Error ${JSON.stringify(e, null, 2)}`
      );
      this.setState({ error: e.message, isLoading: false });
    }
  };

  renderConfirmationForm() {
    return (
      <form onSubmit={this.handleConfirmationSubmit}>
        <FormGroup controlId="confirmationCode" bsSize="large">
          <ControlLabel>Confirmation Code</ControlLabel>
          <FormControl
            autoFocus
            type="tel"
            value={this.state.confirmationCode}
            onChange={this.handleChange}
          />
          <HelpBlock>Please check your email for the code.</HelpBlock>
        </FormGroup>
        <LoaderButton
          block
          bsSize="large"
          disabled={!this.validateConfirmationForm()}
          type="submit"
          isLoading={this.state.isLoading}
          text="Verify"
          loadingText="Verifying…"
        />
      </form>
    );
  }

  renderSignUpForm() {
    return (
      <form onSubmit={this.handleSubmit}>
        <FormGroup controlId="email" bsSize="large">
          <ControlLabel>Email</ControlLabel>
          <FormControl
            autoFocus
            type="email"
            value={this.state.email}
            onChange={this.handleChange}
          />
        </FormGroup>
        <FormGroup controlId="password" bsSize="large">
          <ControlLabel>Password</ControlLabel>
          <FormControl
            type="password"
            value={this.state.password}
            onChange={this.handleChange}
          />
        </FormGroup>
        <FormGroup controlId="confirmPassword" bsSize="large">
          <ControlLabel>Confirm Password</ControlLabel>
          <FormControl
            type="password"
            value={this.state.confirmPassword}
            onChange={this.handleChange}
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
      </form>
    );
  }

  render() {
    return (
      <div className="Signup">
        {this.state.modalShowing
          ? this.renderConfirmationForm()
          : this.renderSignUpForm()}
      </div>
    );
  }
}
