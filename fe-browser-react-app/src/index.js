// import React from 'react';
// import ReactDOM from 'react-dom';
// import './index.css';
// import App from './App';
// import registerServiceWorker from './registerServiceWorker';

// ReactDOM.render(<App />, document.getElementById('root'));
// registerServiceWorker();

import React from 'react';
import { render } from 'react-snapshot';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';
import Amplify from 'aws-amplify';
import awsConfig from './awsConfig';

Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: awsConfig.cognito.REGION,
    userPoolId: awsConfig.cognito.USER_POOL_ID,
    identityPoolId: awsConfig.cognito.IDENTITY_POOL_ID,
    userPoolWebClientId: awsConfig.cognito.APP_CLIENT_ID
  },
  Storage: {
    region: awsConfig.s3.REGION,
    bucket: awsConfig.s3.BUCKET,
    identityPoolId: awsConfig.cognito.IDENTITY_POOL_ID
  },
  API: {
    name: 'photos',
    endpoint: awsConfig.apiGateway.URL,
    region: awsConfig.apiGateway.REGION
  }
});

render(
  <Router>
    <App />
  </Router>,
  document.getElementById('root')
);
