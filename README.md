# aws-cdk-lambda-test-drive

Taking AWS CDK with Lambda for a spin!

## requirements

Looking to build with aws-cdk the following.

-   [x] lambda app with code from bucket
-   [x] code pipeline
    -   [x] source: codecommit
    -   [x] build: upload artifact to s3
    -   [x] build: update-function-code

## usage

Outputs stack diff

```bash
npm run cdk diff
```

Deploy stack

```bash
npm run cdk deploy
```

Cleanup/Destroy stack

```bash
npm run cdk destroy
```

## references

-   [aws cdk lambda readme](https://docs.aws.amazon.com/cdk/api/latest/docs/aws-lambda-readme.html)
-   [Building a continuous delivery pipeline for a Lambda application with AWS CodePipeline](https://docs.aws.amazon.com/lambda/latest/dg/build-pipeline.html)
