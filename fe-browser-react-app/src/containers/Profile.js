import React, { Component } from 'react';
import { Button, Thumbnail } from 'react-bootstrap';
import { Auth, API, Storage } from 'aws-amplify';

import './Profile.css';
import ReactDropzone from 'react-dropzone';

export default class Profile extends Component {
  constructor(props) {
    super(props);

    // console.log("calling from constructor", this.props.userRoles);

    this.state = {
      isLoading: true,
      isAdmin: false,
      userId: '',
      files: [],
      profile: null,
      userPhotoURL: null
    };
  }

  async componentDidMount() {
    try {
      const currentSession = await Auth.currentSession();
      if (currentSession) {
        try {
          const cognitoUserInfo = await Auth.currentUserInfo();
          const userId = cognitoUserInfo.id;
          this.setState({
            userId
          });
          try {
            const profile = await API.get('smily-faces', `/profile`);
            console.log(`Response: ${JSON.stringify(profile, null, 2)}`);
            this.setState({
              profile
            });

            if (profile.userPhoto) {
              try {
                const userPhotoURL = await Storage.vault.get(profile.userPhoto);
                this.setState({ userPhotoURL });
              } catch (e) {
                console.log(
                  `Error in Storage.vault.get(profile.userPhoto): ${JSON.stringify(
                    e,
                    null,
                    2
                  )}`
                );
              }
            }
          } catch (e) {
            console.log(
              `Error in API.get('smily-faces','/profile'): ${JSON.stringify(
                e.response.data,
                null,
                2
              )}`
            );
          }
        } catch (e) {
          console.log(
            `Error in Auth.currentUserInfo(): ${JSON.stringify(e, null, 2)}`
          );
        }
      }
    } catch (e) {
      console.log(
        `Error in Auth.currentSession(): ${JSON.stringify(e, null, 2)}`
      );
    }

    this.setState({
      isLoading: false
    });
  }

  createProfile = async event => {
    event.preventDefault();

    this.setState({ isLoading: true });

    let profile = null;

    try {
      const response = API.post('smily-faces', `/profile`, {
        body: { createOnSignUp: true }
      });
      console.log(`Response: ${JSON.stringify(response, null, 2)}`);

      profile = response;
    } catch (e) {
      console.log(`Error: ${JSON.stringify(e.response.data, null, 2)}`);
    }

    if (profile) {
      this.setState({
        profile
      });
    }

    this.setState({ isLoading: false });
  };

  onDrop = (acceptedFiles, rejectedFiles) => {
    console.log(acceptedFiles);
    this.setState({
      files: acceptedFiles
    });
  };

  uploadProfilePhoto = async event => {
    event.preventDefault();

    const file = this.state.files[0];

    try {
      const stored = await Storage.vault.put(
        `profile/photo.${file.name.split('.').pop()}`,
        file,
        {
          contentType: file.type
        }
      );
      const uploadedFile = stored.key;
      window.URL.revokeObjectURL(file.preview);
      console.log('Uploaded:', uploadedFile);
      const { profile } = this.state;
      profile.userPhoto = uploadedFile;
      this.setState({
        files: [],
        profile
      });

      try {
        // Update profile photo prop
        const response = await API.put('smily-faces', `/profile`, {
          body: { userPhoto: uploadedFile }
        });
        console.log(`Response: ${JSON.stringify(response, null, 2)}`);
      } catch (e) {
        console.log(`Error: ${JSON.stringify(e, null, 2)}`);
      }

      // Get URL of photo from s3
      try {
        const userPhotoURL = await Storage.vault.get(uploadedFile);
        this.setState({ userPhotoURL });
      } catch (e) {
        console.log(`Error: ${JSON.stringify(e, null, 2)}`);
      }
    } catch (e) {
      console.log(`Error: ${JSON.stringify(e, null, 2)}`);
    }
  };

  render() {
    const { files } = this.state;
    let previews = null;
    if (files.length > 0) {
      previews = (
        <div>
          <h4>Preview</h4>
          <Thumbnail src={files[0].preview} alt="">
            <h5>{files[0].name}</h5>
          </Thumbnail>
        </div>
      );
    }

    return this.state.isLoading ? (
      'Loading...'
    ) : this.state.profile ? (
      <div>
        <h4>User profile</h4>
        <p>UserId: {this.state.profile.userId}</p>
        <p>Created: {this.state.profile.createdAt}</p>
        {this.state.profile.userPhoto ? (
          <div>
            <Thumbnail src={this.state.userPhotoURL} alt="user profile photo">
              User profile photo
            </Thumbnail>
          </div>
        ) : (
          <div>
            <ReactDropzone
              onDrop={this.onDrop}
              accept="image/*"
              multiple={false}
            >
              Drop your photo here!
            </ReactDropzone>
            <Button onClick={this.uploadProfilePhoto} disabled={!files.length}>
              Upload Photo
            </Button>
            {previews}
          </div>
        )}
      </div>
    ) : (
      <div>
        <p>No profile found... You can create one here: </p>
        <Button onClick={this.createProfile}>Create Profile</Button>
      </div>
    );
  }
}
