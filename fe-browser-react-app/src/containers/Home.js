import React, { Component } from 'react';
import {
  PageHeader,
  ListGroup,
  Grid,
  Col,
  Row,
  Thumbnail
} from 'react-bootstrap';
import { Storage } from 'aws-amplify';

import './Home.css';

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      photos: []
    };
  }

  async componentDidMount() {
    if (this.props.isAuthenticated) {
      try {
        const response = await Storage.vault.list('');
        console.log(
          `Storage::list(): Response = ${JSON.stringify(response, null, 2)}`
        );
        let photos = [...response].filter(f =>
          /\.(gif|jpg|jpeg|tiff|png)$/i.test(f.key)
        );
        photos = await Promise.all(
          photos.map(async p => {
            const photo = {};
            photo.key = p.key;
            photo.url = await Storage.vault.get(p.key);
            return photo;
          })
        );
        this.setState({ photos });
      } catch (e) {
        console.log(`Storage::list(): Error = ${JSON.stringify(e, null, 2)}`);
      }
    }
  }

  renderLander() {
    return (
      <div className="Home-lander">
        <h1>Welcome to SmilyPhotos App!</h1>
        <p>Please Login</p>
      </div>
    );
  }

  renderPhotoThumbs(photos) {
    return null;
  }

  renderPhotos() {
    const { photos } = this.state;
    let previews = null;
    if (photos.length > 0) {
      previews = photos.map((photo, index) => {
        return (
          <Col xs={6} md={4} key={photo.key}>
            <Row>
              <Thumbnail src={photo.url} alt="50x50">
                <h5>{photo.key}</h5>
              </Thumbnail>
            </Row>
          </Col>
        );
      });
    }
    return (
      <div className="Home-photos">
        <PageHeader>Your photos</PageHeader>
        <Grid>{previews}</Grid>
        <ListGroup>
          {!this.state.isLoading && this.renderPhotoThumbs(this.state.photos)}
        </ListGroup>
      </div>
    );
  }

  render() {
    return (
      <div className="Home-container">
        {this.props.isAuthenticated ? this.renderPhotos() : this.renderLander()}
      </div>
    );
  }
}
