import React, { Component } from 'react';
import './Home.css'
import { Button, Form, ControlLabel, FormControl, FormGroup } from 'react-bootstrap';
import LoaderButton from '../components/LoaderButton';
import { s3Upload } from '../libs/s3Upload';

export default class Home extends Component {
  constructor(props){
    super(props);

    this.state = {
      filesToUpload: [],
      isUploading: false
    }
  }

  handleChange = (event) => {
    let files = [];
    for (let i = 0; i < event.target.files.length; i++) {
      const element = event.target.files[i];
      files.push(element);
    }
    this.setState({
      [event.target.id]: files
    });
  }
  
  validateForm = () => this.state.filesToUpload.length > 0;

  handleSubmit = async (event) => {
    event.preventDefault();

    this.setState({
      isUploading: true
    });
    
    try {
      const photo = await s3Upload(file);
      // this.state.filesToUpload.forEach(file => {
      // })
      this.setState({
        isUploading: false
      })
      
    } catch (e) {
      alert(e);
    }
  }
  
    
  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <FormGroup 
            controlId="filesToUpload"
          >
            <ControlLabel>Select photos</ControlLabel>
            <FormControl
              type="file"
              multiple
              onChange={this.handleChange}
            />
          </FormGroup>
          <LoaderButton 
            block
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            text="Upload"
            loadingText="Uploading..."
            isLoading={this.state.isUploading}
          />
        </form>
        <ul>
          {this.state.filesToUpload.map((file, i) => <li key={i}>{file.name}</li>)}
        </ul>
      </div>
    )
  }
}
