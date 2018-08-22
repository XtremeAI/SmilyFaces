import React, { Component } from 'react';
import { Button, Thumbnail, Grid, Row, Col } from 'react-bootstrap';
import ReactDropzone from 'react-dropzone';
import { Storage } from 'aws-amplify';
import awsConfig from './../awsConfig';

import './Home.css';

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

    this.setState({
      files: []
    });
  };

  render() {
    const { files } = this.state;
    let previews = null;
    if (files.length > 0) {
      previews = files.map((file, index) => {
        return (
          <Col xs={6} md={4} key={file.name}>
            <Row>
              <Thumbnail src={file.preview} alt="50x50">
                <h5>{file.name}</h5>
              </Thumbnail>
            </Row>
          </Col>
        );
      });
    }
    return this.state.isAdmin ? (
      <div>
        <div>
          <ReactDropzone onDrop={this.onDrop} accept="image/*">
            Drop your photos here!
          </ReactDropzone>
          <Button onClick={this.uploadPhotos} disabled={files.length === 0}>
            Upload photos!
          </Button>
          <Grid>{previews}</Grid>
        </div>
      </div>
    ) : (
      <div> Home</div>
    );
  }
}
