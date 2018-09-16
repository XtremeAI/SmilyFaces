import * as dynamoDbLib from "../libs/dynamodb-lib";
import { success, failure } from "../libs/response-lib";

export async function main(event, context, callback) {
    // Request body is passed in as a JSON encoded string in 'event.body'

    const data = JSON.parse(event.body);

    const params = {
        TableName: process.env.tableName,
        // 'Key' defines the partition key and sort key of the item to be updated
        // - 'photoId': path parameter
        Key: {
            userId: event.requestContext.identity.cognitoIdentityId,
            photoId: 'Profile'
        },
        // 'UpdateExpression' defines the attributes to be updated
        // 'ExpressionAttributeValues' defines the value in the update expression
        UpdateExpression: "SET userPhoto = :userPhoto",
        ExpressionAttributeValues: {
            ":userPhoto": data.userPhoto ? data.userPhoto : null
        },
        ReturnValues: "ALL_NEW"
    };

    try {
        await dynamoDbLib.call("update", params);
        callback(null, success({ status: true }));
    } catch(e) {
        callback(null, failure({ status: false }));
    }
}