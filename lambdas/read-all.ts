import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDB } from "aws-sdk";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
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
