import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { v4 } from "uuid";
import { pbkdf2Sync } from "crypto";
import { statusCreate, statusFail } from "./utils/responses";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (!event.body) return statusFail();
  const { email, password } = JSON.parse(event.body);
  if (!email) return statusFail("Missing email");
  if (!password) return statusFail("Missing password");

  const client = new DynamoDB();
  const user = await client
    .query({
      TableName: "Users",
      IndexName: "indexEmail1",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: { ":email": { S: email } },
      Limit: 1,
    })
    .promise();

  if (user.Items && user.Items?.length > 0)
    return statusFail("User already exists");

  await client
    .putItem({
      TableName: "Users",
      Item: {
        uuid: {
          S: v4(),
        },
        email: {
          S: email,
        },
        password: {
          S: pbkdf2Sync(password, "thisisthesalt", 1000, 64, "sha512").toString(
            "hex"
          ),
        },
      },
    })
    .promise();
  return statusCreate();
};
