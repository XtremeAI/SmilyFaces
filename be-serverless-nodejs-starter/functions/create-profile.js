import * as dynamoDbLib from "../libs/dynamodb-lib";
import { success, failure } from "../libs/response-lib";

export async function main(event, context, callback) {
    // Request body is passed in as a JSON encoded string in 'event.body'

    const data = JSON.parse(event.body);

    if (data.createOnSignUp !== true) {
        callback(null, failure({ status: false }));
    }

    const params = {
        TableName: process.env.tableName,
        // 'Item' contains the attributes of the item to be created
        // - 'authorId': user identities are federated through the
        // Cognito Identity Pool, we will use the identity id
        // as the user id of the authenticated user
        // - 'photoId': a unique uuid
        // - 'content': parsed from request body
        // - 'attachment': parsed from request body
        // - 'createdAt': current Unix timestamp
        Item: {
            userId: event.requestContext.identity.cognitoIdentityId,
            photoId: "Profile",
            userPhoto: null,
            userFaceId: null,
            createdAt: Date.now()
        }
    };

    try {
        await dynamoDbLib.call("put", params);
        callback(null, success(params.Item));
    } catch(e) {
        callback(null, failure({ status: false }));
    }
}