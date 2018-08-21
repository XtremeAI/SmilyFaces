import React, { Component } from 'react';
import awsConfig from './../awsConfig';
import ReactDropzone from 'react-dropzone';
import { Storage } from 'aws-amplify';

import './Home.css';
import { Button } from 'react-bootstrap';

export default class Home extends Component {
  constructor(props) {
    super(props);

    // console.log("calling from constructor", this.props.userRoles);

    this.state = {
      isAdmin: false,
      files: []
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // console.log("calling from componentDidUpdate", this.props.userRoles);
    if (this.props.userRoles !== prevProps.userRoles) {
      this.setState({ isAdmin: [...this.props.userRoles].includes('Admins') });
    }
  }

  onDrop = (acceptedFiles, rejectedFiles) => {
    console.log(acceptedFiles);
    this.setState({
      files: acceptedFiles
    });
    // POST to a test endpoint for demo purposes
    // const req = request.post('https://httpbin.org/post');

    // files.forEach(file => {
    //   req.attach(file.name, file);
    // });

    // req.end();
  };

  uploadPhotos = async event => {
    event.preventDefault();

    const uploadedFiles = [];

    for (const file of this.state.files) {
      const filename = `${Date.now()}-${file.name}`;

      const stored = await Storage.put(filename, file, {
        contentType: file.type
      });

      uploadedFiles.push(stored.key);

      window.URL.revokeObjectURL(file.preview);
    }

    console.log('Uploaded:', uploadedFiles);
  };

  render() {
    const { files } = this.state;
    let previews = null;
    if (files.length > 0) {
      previews = files.map((file, index) => {
        return (
          <li key={index}>
            <img src={file.preview} alt="" />
          </li>
        );
      });
    }
    return this.state.isAdmin ? (
      <div>
        <div>
          <ReactDropzone onDrop={this.onDrop}>
            Drop your photos here!
          </ReactDropzone>
          <ul>{previews}</ul>
          <Button onClick={this.uploadPhotos}>Upload photos!</Button>
        </div>
      </div>
    ) : (
      <div> Home</div>
    );
  }
}
