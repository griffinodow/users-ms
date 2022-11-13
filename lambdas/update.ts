import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { isAuthorized } from "./utils/authorizer";
import { statusFail, statusForbidden } from "./utils/responses";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (!event.body) return statusFail("Request body required");
  const uuid = event.pathParameters?.uuid;
  const body = JSON.parse(event.body);
  const email = body?.email;
  if (!uuid) return statusFail("Uuid required");
  if (!isAuthorized(event, uuid)) return statusForbidden();

  const client = new DynamoDB();
  const data = await client
    .getItem({
      TableName: "Users",
      Key: {
        id: { S: uuid },
      },
      ProjectionExpression: "id, email",
    })
    .promise();
  const user = data?.Item && DynamoDB.Converter.unmarshall(data.Item);
  if (!user) return statusFail("User does not exist");

  await client
    .updateItem({
      TableName: "Users",
      Key: {
        id: {
          S: user.id,
        },
      },
      ExpressionAttributeValues: {
        ":email": { S: email },
      },
      UpdateExpression: "SET email = :email",
    })
    .promise();

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `success`,
    }),
  };
};
