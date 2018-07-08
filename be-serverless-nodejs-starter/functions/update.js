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
            photoId: event.pathParameters.id
        },
        // 'UpdateExpression' defines the attributes to be updated
        // 'ExpressionAttributeValues' defines the value in the update expression
        UpdateExpression: "SET content = :content, attachment = :attachment",
        ExpressionAttributeValues: {
            ":attachment": data.attachment ? data.attachment : null,
            ":content": data.content ? data.content : null
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