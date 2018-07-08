import * as dynamoDbLib from "../libs/dynamodb-lib";
import { success, failure } from "../libs/response-lib";

export async function main(event, context, callback) {
    // Request body is passed in as a JSON encoded string in 'event.body'

    const params = {
        TableName: process.env.tableName,
        // 'KeyConditionExpression' defines the condition for the query
        // - 'authorId = :authorId': only return items with matching 'authorId'
        //   partition key
        // 'ExpressionAttributeValues' defines the value in the condition
        // - ':authorId': defines 'authorId' to be Identity Pool identity id
        //   of the authenticated user
        ExpressionAttributeValues: {
            ":authorId": event.requestContext.identity.cognitoIdentityId
        },
        FilterExpression: "authorId = :authorId"
    };

    try {
        const result = await dynamoDbLib.call("scan", params);
        callback(null, success(result.Items))
    } catch (e) {
        console.log(e);
        callback(null, failure({ status: false }));
    }
}