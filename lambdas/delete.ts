import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { statusFail, statusForbidden } from "./utils/responses";
import { DynamoDB } from "aws-sdk";
import { isAuthorized } from "./utils/authorizer";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const uuid = event.pathParameters?.uuid;
  if (!uuid) return statusFail("Uuid required");
  if (!isAuthorized(event, uuid)) return statusForbidden();

  const client = new DynamoDB();
  await client
    .deleteItem({
      TableName: "Users",
      Key: {
        id: { S: uuid },
      },
    })
    .promise();
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "success",
    }),
  };
};
