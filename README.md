# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template


### Bootstrapping for AWS CDK S3 stack that will be deployed using Assets
* `cdk bootstrap --app "npx ts-node bin/common.ts" aws://787837163694/eu-central-1`

### S3 Assets Bucket Deployment
* `cdk synth --app "npx ts-node bin/common.ts" AssetsBucketStack-dev`
* `cdk deploy --app "npx ts-node bin/common.ts" AssetsBucketStack-dev`

### Certificate Manager Stack (Virginia)
* `cdk synth --app "npx ts-node bin/common.ts" CertificateManagerStack-virginia`
* `cdk deploy --app "npx ts-node bin/common.ts" CertificateManagerStack-virginia`

### CloudFront Distribution Stack Deployment
* `cdk synth --app "npx ts-node bin/common.ts" AssetsCloudfrontDistributionStack-dev`
* `cdk deploy --app "npx ts-node bin/common.ts" AssetsCloudfrontDistributionStack-dev`