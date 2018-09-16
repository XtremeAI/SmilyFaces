import * as dynamoDbLib from "../libs/dynamodb-lib";
import { success, failure } from "../libs/response-lib";

export async function main(event, context, callback) {
    // Request body is passed in as a JSON encoded string in 'event.body'
    // console.log(JSON.stringify(event));
    const params = {
        TableName: process.env.tableName,
        // 'Key' defines the partition key and sort key of the item to be retrieved
        // - 'photoId': path parameter
        Key: {
            userId: event.requestContext.identity.cognitoIdentityId,
            photoId: 'Profile'
        }
    };

    try {
        const result = await dynamoDbLib.call("get", params);
        if (result.Item) {
            callback(null, success(result.Item))
        } else {
            callback(null, failure({ status: false, error: "Item not found." }));
        }
    } catch (e) {
        callback(null, failure({ status: false }));
    }
}