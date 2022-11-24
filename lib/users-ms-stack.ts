import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import {
  AttributeType,
  BillingMode,
  Table,
  ProjectionType,
} from "aws-cdk-lib/aws-dynamodb";
import {
  EndpointType,
  LambdaIntegration,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { CfnApiMapping } from "aws-cdk-lib/aws-apigatewayv2";

export class UsersMsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Constants
    const subdomain = `api.tasks.griffindow.com`;

    // DynamoDB
    const table = new Table(this, "Users", {
      tableName: "Users",
      partitionKey: { name: "id", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    table.addGlobalSecondaryIndex({
      indexName: "indexEmail",
      partitionKey: { name: "email", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    // Create user Lambda
    const handleCreateUser = new NodejsFunction(this, "UsersCreateHandler", {
      runtime: Runtime.NODEJS_16_X,
      handler: "handler",
      entry: path.join(__dirname, `../lambdas/create.ts`),
    });

    // Read user Lambda
    const handleReadAllUser = new NodejsFunction(this, "UsersReadAllHandler", {
      runtime: Runtime.NODEJS_16_X,
      handler: "handler",
      entry: path.join(__dirname, `../lambdas/read-all.ts`),
    });

    // Read user Lambda
    const handleReadUser = new NodejsFunction(this, "UsersReadHandler", {
      runtime: Runtime.NODEJS_16_X,
      handler: "handler",
      entry: path.join(__dirname, `../lambdas/read.ts`),
    });

    // Update user Lambda
    const handleUpdateUser = new NodejsFunction(this, "UsersUpdateHandler", {
      runtime: Runtime.NODEJS_16_X,
      handler: "handler",
      entry: path.join(__dirname, `../lambdas/update.ts`),
    });

    // Update user Lambda
    const handleDeleteUser = new NodejsFunction(this, "UsersDeleteHandler", {
      runtime: Runtime.NODEJS_16_X,
      handler: "handler",
      entry: path.join(__dirname, `../lambdas/delete.ts`),
    });

    handleCreateUser.addToRolePolicy(
      new PolicyStatement({
        actions: ["dynamodb:Query", "dynamodb:PutItem"],
        resources: ["*"],
      })
    );

    handleReadAllUser.addToRolePolicy(
      new PolicyStatement({
        actions: ["dynamodb:Scan"],
        resources: ["*"],
      })
    );

    handleReadUser.addToRolePolicy(
      new PolicyStatement({
        actions: ["dynamodb:GetItem"],
        resources: ["*"],
      })
    );

    handleUpdateUser.addToRolePolicy(
      new PolicyStatement({
        actions: ["dynamodb:UpdateItem", "dynamodb:GetItem"],
        resources: ["*"],
      })
    );

    handleDeleteUser.addToRolePolicy(
      new PolicyStatement({
        actions: ["dynamodb:DeleteItem"],
        resources: ["*"],
      })
    );

    // API Gateway
    const api = new RestApi(this, "UsersGw", {
      endpointTypes: [EndpointType.REGIONAL],
      defaultCorsPreflightOptions: {
        allowOrigins: ["*"],
      },
    });
    api.root.addMethod("POST", new LambdaIntegration(handleCreateUser));

    api.root.addMethod("GET", new LambdaIntegration(handleReadAllUser));
    const users = api.root.addResource("{uuid}");
    users.addMethod("GET", new LambdaIntegration(handleReadUser));
    users.addMethod("PUT", new LambdaIntegration(handleUpdateUser));
    users.addMethod("DELETE", new LambdaIntegration(handleDeleteUser));

    // API path mapping
    new CfnApiMapping(this, `UsersMsPathMapping`, {
      apiId: api.restApiId,
      domainName: subdomain,
      stage: api.deploymentStage.stageName,
      apiMappingKey: "v1/users",
    });
  }
}
