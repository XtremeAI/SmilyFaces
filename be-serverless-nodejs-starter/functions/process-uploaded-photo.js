import uuid from "uuid";
import AWS from "aws-sdk";
import Sharp from "sharp"; // http://sharp.dimens.io

AWS.config.update({ region: "us-east-1" });

const rekognition = new AWS.Rekognition();
const s3 = new AWS.S3();

import * as dynamoDbLib from "../libs/dynamodb-lib";

export async function main (event, context) {

  console.log (`Got the following event: ${JSON.stringify(event)}`);

  const collection = process.env.collectionName;
  const keyURL = event.Records[0].s3.object.key;
  const bucket = event.Records[0].s3.bucket.name
  const key = decodeURIComponent(keyURL);

  let userIds = [];

  const paramsDetectFaces = {
    Image: {
      S3Object: {
        Bucket: bucket,
        Name: key
      }
    },
    "Attributes": [
      "DEFAULT"
    ]
  };

  try {

    const detectFacesResponse = await rekognition.detectFaces(paramsDetectFaces).promise();

    console.log(`OK, we attempted to detect faces on the photo '${paramsDetectFaces.Image.S3Object.Name} and received this response:'`);

    console.log(JSON.stringify(detectFacesResponse));

    if (detectFacesResponse.FaceDetails.length === 0) {
      console.log(`No faces detected! Terminating...`);
      // TODO: Implement shared photos
      return;
    }

    const detectedFaces = detectFacesResponse.FaceDetails;

    try {
      const photoObj = await s3.getObject({Bucket: bucket, Key: key}).promise();
      const photoData = photoObj.Body;
      const photoMetadata = await Sharp(photoData).metadata();

      // INFO: Parrallel execution of the below
      async function searchTheFace(face) {
        const rekoBox = face.BoundingBox;
        const pixelBox = {
          left: Math.round(photoMetadata.width*rekoBox.Left),
          top: Math.round(photoMetadata.height*rekoBox.Top), 
          width: Math.round(photoMetadata.width*rekoBox.Width), 
          height: Math.round(photoMetadata.height*rekoBox.Height)
      }
        console.log(`Bounding box: ${JSON.stringify(pixelBox)}`);
  
        const croppedPhoto = await Sharp(photoData)
          .extract({
            left: pixelBox.left, 
            top: pixelBox.top, 
            width: pixelBox.width, 
            height: pixelBox.height
          })
          .toBuffer();
  
          try {
            const paramsSearchFacesByImageInput = {
              CollectionId: collection, 
              Image: {
                Bytes: croppedPhoto
              }
            };
            const responseSearchFacesByImageInput = await rekognition.searchFacesByImage(paramsSearchFacesByImageInput).promise();
  
            console.log(`OK, we attempted to search the cropped face in our photo collection '${collection}' and received this response:`);
  
            console.log(JSON.stringify(responseSearchFacesByImageInput));
  
            // TODO: Maybe we need to select the best match in the future
            if (responseSearchFacesByImageInput.FaceMatches.length === 0) {
              console.log(`No faces found for Bounding box: ${JSON.stringify(pixelBox)}`);
            }
            else {
              userIds.push(responseSearchFacesByImageInput.FaceMatches[0].Face.ExternalImageId);
            }
          } catch (e) {
            console.log(`Error while searchFacesByImage: ${e}`);
          }
      }

      async function searchForFacesInParallel(faces) {
        // map array to promises
        const promises = faces.map(searchTheFace);
        // wait untill all resolved
        await Promise.all(promises);
      }

      await searchForFacesInParallel(detectedFaces);

      // INFO: Synchronious execution of the above

      // for (const face of detectedFaces) {
      //   const rekoBox = face.BoundingBox;
      //   const pixelBox = {
      //     left: Math.round(photoMetadata.width*rekoBox.Left),
      //     top: Math.round(photoMetadata.height*rekoBox.Top), 
      //     width: Math.round(photoMetadata.width*rekoBox.Width), 
      //     height: Math.round(photoMetadata.height*rekoBox.Height)
      // }
      //   console.log(`Bounding box: ${JSON.stringify(pixelBox)}`);
  
      //   const croppedPhoto = await Sharp(photoData)
      //     .extract({
      //       left: pixelBox.left, 
      //       top: pixelBox.top, 
      //       width: pixelBox.width, 
      //       height: pixelBox.height
      //     })
      //     .toBuffer();
  
      //     try {
      //       const paramsSearchFacesByImageInput = {
      //         CollectionId: collection, 
      //         Image: {
      //           Bytes: croppedPhoto
      //         }
      //       };
      //       const responseSearchFacesByImageInput = await rekognition.searchFacesByImage(paramsSearchFacesByImageInput).promise();
  
      //       console.log(`OK, we attempted to search the cropped face in our photo collection '${collection}' and received this response:`);
  
      //       console.log(JSON.stringify(responseSearchFacesByImageInput));
  
      //       // TODO: Maybe we need to select the best match in the future
      //       userIds.push(responseSearchFacesByImageInput.FaceMatches[0].Face.ExternalImageId);
      //     } catch (e) {
      //       console.log(`Error while searchFacesByImage: ${e}`);
      //     }
      // }

      console.log(`At the end we matched the phtoto to the following userIds:`);
      console.log(userIds);

      // Copy photo to processed folder and give it a unique name
      const newPhotoId = uuid.v1();
      const newPhotoKey = `public/processed/${newPhotoId}.${key.split('.').pop()}`;
      const paramsCopy = {
        Bucket: bucket, 
        CopySource: `${bucket}/${key}`, 
        Key: newPhotoKey
      };

      console.log(JSON.stringify(paramsCopy));

      try {
        const responseCopyObject = await s3.copyObject(paramsCopy).promise();
        
        console.log(`OK, we coppied our photo to '${newPhotoKey}' and received this response:`);
  
        console.log(JSON.stringify(responseCopyObject));

        // Save thumb
        const thumbPhoto = await Sharp(photoData)
        .resize(200,200)
        .max()
        .toBuffer();
        const thumbKey = `public/processed/thumbs/thumb-${newPhotoId}.${key.split('.').pop()}`;

        try {
          const responsePutObject = await s3.putObject({
            Body: thumbPhoto, 
            Bucket: bucket, 
            ContentType: photoObj.ContentType,
            Key: thumbKey
          }).promise();

          console.log(`OK, we create a thumbnail of our photo in '${thumbKey}' and received this response:`);
          console.log(JSON.stringify(responsePutObject));

          let isRecorded = true;

          for (const userId of userIds) {
            const paramsDb = {
              TableName: process.env.tableName,
              Item: {
                userId: userId,
                photoId: newPhotoId,
                photoKey: newPhotoKey,
                thumbKey: thumbKey,
                createdAt: Date.now()
              }
            };
            try {
              await dynamoDbLib.call("put", paramsDb);
            } catch(e) {
              console.log(`Error while creatingDbRecord: ${JSON.stringify(e)}`);
              isRecorded = false;
            }
          }

          if (isRecorded) {
            console.log(`All done. Recorded photoId: ${newPhotoKey}`);
            const paramsDelete = {
              Bucket: bucket,
              Key: key
            };
            try {
              const responseDeleteObject = await s3.deleteObject(paramsDelete).promise();
              console.log(`OK, we deleted our uploaded photo '${key}' and received this response:`);
              console.log(JSON.stringify(responseDeleteObject));
            } catch (e) {
              console.log(`Error while deleteObject: ${e} `);
            }
          }
        } catch (e) {
          console.log(`Error while putObject: ${e} `);
        }
      } catch (e) {
        console.log(`Error while copyObject: ${e} `);
      }
    } catch (e) {
      console.log(`Error while getObject: ${e}`);
    }
  } catch (e) {
    console.log(`Error while detectFaces: ${e}`);
  }

}