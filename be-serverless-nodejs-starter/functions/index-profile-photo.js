import AWS from "aws-sdk"

AWS.config.update({ region: "us-east-1" });

import * as dynamoDbLib from "../libs/dynamodb-lib";

export async function main (event, context) {

  // console.log (`Got the following event: ${JSON.stringify(event)}`);

  // console.log (`Got the following process.env: ${JSON.stringify(process.env.collection)}`);

  const rekognition = new AWS.Rekognition();

  const collection = process.env.collection;
  const keyURL = event.Records[0].s3.object.key;
  const key = decodeURIComponent(keyURL);
  const userId = key.split('/')[1]

  const params = {
    CollectionId: collection, 
    Image: {
      S3Object: {
        Bucket: event.Records[0].s3.bucket.name,
        Name: key
      }
    },
    ExternalImageId: userId, 
    DetectionAttributes: [
        "ALL"
    ]
  };

  console.log (`Constructed the following params: ${JSON.stringify(params)}`);
  
  const listCollectionsResponse1 = await rekognition.listCollections().promise();

  if (!listCollectionsResponse1.CollectionIds.includes(collection)) {
    console.log(`A collection '${collection}' has to be created first!`);
    try {
      const createCollectionResponse = await rekognition.createCollection({CollectionId: collection}).promise();
      console.log(`Collection '${collection}' created: ${JSON.stringify(createCollectionResponse)}`);
    } catch (e) {
      console.log(`Error while createCollection: ${JSON.stringify(e)}`);
    }
  }

  const listCollectionsResponse2 = await rekognition.listCollections().promise();

  if (!listCollectionsResponse2.CollectionIds.includes(collection)) {
    console.log(`A collection '${collection}' is still not created! Terminating...`);
    return;
  }

  console.log(`OK, the collection '${collection}' is ready so we can preceed with photo indexing...`);

  try {
    const indexFacesResponse = await rekognition.indexFaces(params).promise();

    console.log(`OK, we got the photo '${params.Image.S3Object.Name}' indexed in '${collection}'`);

    console.log(`and received this response: ${JSON.stringify(indexFacesResponse)}`);

    const faceId = indexFacesResponse.FaceRecords[0].Face.FaceId;

    const paramsDb = {
      TableName: process.env.profileTableName,
      // 'Key' defines the partition key and sort key of the item to be updated
      // - 'photoId': path parameter
      Key: {
          userId: userId
      },
      // 'UpdateExpression' defines the attributes to be updated
      // 'ExpressionAttributeValues' defines the value in the update expression
      UpdateExpression: "SET userFaceId = :userFaceId",
      ExpressionAttributeValues: {
          ":userFaceId": faceId ? faceId : null
      },
      ReturnValues: "ALL_NEW"
    };

    try {
        await dynamoDbLib.call("update", paramsDb);
        console.log(`All done. Recorded faceId: ${faceId}`);
    } catch(e) {
      console.log(`Error while updatingDb: ${JSON.stringify(e)}`);
    }
  } catch (e) {
    console.log(`Error while indexFaces: ${JSON.stringify(e)}`);
  }
}