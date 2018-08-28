const dev = {
  s3: {
    REGION: 'us-east-1',
    BUCKET: 'smilefaces-serverless-svc-dev-photosbucket-1oniybgcieyg1'
  },
  apiGateway: {
    REGION: 'us-east-1',
    URL: 'https://k7a7wgcqtk.execute-api.us-east-1.amazonaws.com/dev'
  },
  cognito: {
    REGION: 'us-east-1',
    USER_POOL_ID: 'us-east-1_Ks2PC9PII',
    APP_CLIENT_ID: '3sqvpe42odis2sv679poqc5f4',
    IDENTITY_POOL_ID: 'us-east-1:1515cba6-b0d7-4c87-b196-cb1a0fb9fcf2'
  }
};

const prod = {
  // s3: {
  //     REGION: "us-east-1",
  //     BUCKET: "smilefaces-serverless-svc-dev-photosbucket-yj3viijieuh9"
  // },
  // apiGateway: {
  //     REGION: "us-east-1",
  //     URL: "https://k7a7wgcqtk.execute-api.us-east-1.amazonaws.com/dev"
  // },
  // cognito: {
  //     REGION: "us-east-1",
  //     USER_POOL_ID: "us-east-1_EP3c94rEl",
  //     APP_CLIENT_ID: "63r53hr2gqfj075caq7qtq4n3t",
  //     IDENTITY_POOL_ID: "us-east-1:c7cc0f23-d65c-4687-9b84-38f176f9b422"
  // }
};

const awsConfig = process.env.REACT_APP_STAGE === 'prod' ? prod : dev;

export default {
  // Add common config values here
  MAX_PHOTO_SIZE: 10000000,
  ...awsConfig
};
