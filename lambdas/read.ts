import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { statusFail } from "./utils/responses";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const uuid = event.pathParameters?.uuid;
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
  const data = DynamoDB.Converter.unmarshall(item);
  delete data.password;

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user: data,
    }),
  };
};
