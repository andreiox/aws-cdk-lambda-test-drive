import * as dotenv from 'dotenv';
import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as lambda from '@aws-cdk/aws-lambda';

dotenv.config();

class MyFunctionStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const bucket = s3.Bucket.fromBucketName(
            this,
            'LambdasBucket',
            'andreiox-lambdas-artifacts',
        );

        const myFunction = new lambda.Function(this, 'MyFunction', {
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'index.handler',
            code: lambda.Code.fromBucket(bucket, 'MyFunction'),
        });
    }
}

const app = new cdk.App();

new MyFunctionStack(app, 'andreiox-myfunction-dev', {
    env: {
        account: process.env.AWS_ACCOUNT,
        region: process.env.AWS_REGION,
    },
});
