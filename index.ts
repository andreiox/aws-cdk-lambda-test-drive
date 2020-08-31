import * as dotenv from 'dotenv';
import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as lambda from '@aws-cdk/aws-lambda';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import * as codebuild from '@aws-cdk/aws-codebuild';
import * as codecommit from '@aws-cdk/aws-codecommit';
import * as iam from '@aws-cdk/aws-iam';

dotenv.config();

interface StageInterface {
    artifact: codepipeline.Artifact;
    stage: codepipeline.IStage;
}

class MyFunctionStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const bucket = s3.Bucket.fromBucketName(
            this,
            'LambdasBucket',
            process.env.S3_BUCKET!,
        );

        const myFunction = new lambda.Function(this, 'MyFunction', {
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'index.handler',
            code: lambda.Code.fromBucket(bucket, process.env.S3_OBJECT!),
        });

        this.createCICDPipeline(this, myFunction);
    }

    createCICDPipeline(stack: cdk.Stack, lambda: lambda.Function) {
        const pipeline = new codepipeline.Pipeline(stack, 'pipeline');

        const source = this.createSourceStage(stack, pipeline);
        const build = this.createBuildStage(stack, pipeline, source, lambda);
    }

    createSourceStage(
        stack: cdk.Stack,
        pipeline: codepipeline.Pipeline,
    ): StageInterface {
        const artifact = new codepipeline.Artifact();

        const stage = pipeline.addStage({
            stageName: 'Source',
            actions: [
                new codepipeline_actions.CodeCommitSourceAction({
                    output: artifact,
                    actionName: 'Source',
                    branch: 'master',
                    trigger: codepipeline_actions.CodeCommitTrigger.EVENTS,
                    repository: codecommit.Repository.fromRepositoryName(
                        stack,
                        `Repository-lambda`,
                        process.env.REPOSITORY_CODECOMMIT!,
                    ),
                }),
            ],
        });

        return { artifact, stage };
    }

    createBuildStage(
        stack: cdk.Stack,
        pipeline: codepipeline.Pipeline,
        source: StageInterface,
        lambda: lambda.Function,
    ): StageInterface {
        const artifact = new codepipeline.Artifact();

        const buildProject = new codebuild.PipelineProject(stack, 'build', {
            buildSpec: codebuild.BuildSpec.fromObject(
                this.getBuildspec(lambda.functionName),
            ),
            environment: {
                computeType: codebuild.ComputeType.SMALL,
                buildImage: codebuild.LinuxBuildImage.STANDARD_4_0,
                privileged: true,
            },
        });

        buildProject.addToRolePolicy(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                resources: ['*'],
                actions: [
                    's3:PutObject',
                    's3:GetObject',
                    'lambda:UpdateFunctionCode',
                ],
            }),
        );

        const stage = pipeline.addStage({
            stageName: 'Build',
            actions: [
                new codepipeline_actions.CodeBuildAction({
                    actionName: 'Build',
                    project: buildProject,
                    input: source.artifact,
                }),
            ],
            placement: {
                justAfter: source.stage,
            },
        });

        return { artifact, stage };
    }

    getBuildspec(lambdaName: string): Record<string, unknown> {
        return {
            version: 0.2,
            phases: {
                install: {
                    'runtime-versions': {
                        nodejs: 12,
                    },
                    commands: ['npm ci'],
                },
                pre_build: {
                    commands: [],
                },
                build: {
                    commands: [
                        `zip ${process.env.S3_OBJECT} *`,
                        `aws s3 cp ${process.env.S3_OBJECT} s3://${process.env.S3_BUCKET}/`,
                    ],
                },
                post_build: {
                    commands: [
                        'echo Updating function code...',
                        `aws lambda update-function-code --function-name ${lambdaName} --s3-bucket ${process.env.S3_BUCKET} --s3-key ${process.env.S3_OBJECT}`,
                    ],
                },
            },
        };
    }
}

const app = new cdk.App();

new MyFunctionStack(app, 'andreiox-myfunction-dev', {
    env: {
        account: process.env.AWS_ACCOUNT,
        region: process.env.AWS_REGION,
    },
});
