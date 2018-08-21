import React, { Component } from 'react';
import './Home.css';
import awsConfig from './../awsConfig';

export default class Home extends Component {
  constructor(props) {
    super(props);

    // console.log("calling from constructor", this.props.userRoles);

    this.state = {
      isAdmin: false
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // console.log("calling from componentDidUpdate", this.props.userRoles);
    if (this.props.userRoles !== prevProps.userRoles) {
      this.setState({ isAdmin: [...this.props.userRoles].includes('Admins') });
    }
  }

  render() {
    return this.state.isAdmin ? (
      <div>
        {' '}
        Please upload photos to{' '}
        <a href={'http://s3.amazonaws.com/' + awsConfig.s3.BUCKET}>
          {' '}
          {'http://s3.amazonaws.com/' + awsConfig.s3.BUCKET}
        </a>
      </div>
    ) : (
      <div> Home</div>
    );
  }
}
