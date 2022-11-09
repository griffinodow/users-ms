#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { UsersMsStack } from "../lib/users-ms-stack";

const app = new cdk.App();
new UsersMsStack(app, "UsersMsStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
