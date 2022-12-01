import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { isAuthorized } from "./utils/authorizer";
import { statusFail, statusForbidden, statusSuccess } from "./utils/responses";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const uuid = event.pathParameters?.uuid;
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
  user.uuid = user.id;
  delete user.id;

  return statusSuccess({ user });
};
