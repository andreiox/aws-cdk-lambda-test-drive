# aws-cdk-lambda-test-drive

Taking AWS CDK with Lambda for a spin!

## requirements

Looking to build with aws-cdk the following.

-   [ ] lambda app
-   [ ] code pipeline
    -   [ ] source: codecommit
    -   [ ] build: upload artifact to s3
    -   [ ] deploy: cloudformation create or replace changeset
    -   [ ] deploy: cloudformation execute changeset

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

-   [Building a continuous delivery pipeline for a Lambda application with AWS CodePipeline](https://docs.aws.amazon.com/lambda/latest/dg/build-pipeline.html)
