import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { statusFail } from "./utils/responses";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (!event.body) return statusFail("Request body required");
  const uuid = event.pathParameters?.uuid;
  const body = JSON.parse(event.body);
  const email = body?.email;
  if (!uuid) return statusFail("Uuid required");

  const client = new DynamoDB();
  const user = await client
    .getItem({
      TableName: "Users",
      Key: {
        uuid: { S: uuid },
      },
    })
    .promise();
  const item = user.Item;
  if (!item) return statusFail("User does not exist");
  const itemData = DynamoDB.Converter.unmarshall(item);

  await client
    .putItem({
      TableName: "Users",
      Item: {
        uuid: {
          S: itemData.uuid,
        },
        email: {
          S: email,
        },
        password: {
          S: itemData.password,
        },
      },
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
