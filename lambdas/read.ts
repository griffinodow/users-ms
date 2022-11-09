import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { statusFail } from "./utils/responses";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const uuid = event.pathParameters?.uuid;
  if (!uuid) return statusFail("Uuid required");

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

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user,
    }),
  };
};
