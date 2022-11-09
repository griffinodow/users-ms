import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { statusFail } from "./utils/responses";
import { DynamoDB } from "aws-sdk";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const uuid = event.pathParameters?.uuid;
  if (!uuid) return statusFail("Uuid required");

  const client = new DynamoDB();
  await client
    .deleteItem({
      TableName: "Users",
      Key: {
        uuid: { S: uuid },
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
