import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { isAuthorized } from "./utils/authorizer";
import { statusForbidden } from "./utils/responses";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (!isAuthorized(event, "3fca7c7c-ecb9-45d6-9a30-7fa60c4744ba"))
    return statusForbidden();
  const client = new DynamoDB();
  const lastEvaluated = event.queryStringParameters?.lastEvaluated;
  const data = await client
    .scan({
      TableName: "Users",
      Limit: 5,
      ExclusiveStartKey: lastEvaluated
        ? {
            id: {
              S: lastEvaluated,
            },
          }
        : undefined,
      ProjectionExpression: "id, email",
    })
    .promise();

  const users = data.Items?.map((user) => DynamoDB.Converter.unmarshall(user));

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: users,
    }),
  };
};
