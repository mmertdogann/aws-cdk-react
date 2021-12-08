import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3Deployment from '@aws-cdk/aws-s3-deployment';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as route53targets from '@aws-cdk/aws-route53-targets';
import * as route53 from '@aws-cdk/aws-route53';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import * as acm from '@aws-cdk/aws-certificatemanager';
export class AwsCdkProjectStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3
    const bucket = new s3.Bucket(this, 'CdkReactBucket', {
      publicReadAccess: true,
      websiteIndexDocument: 'index.html',
    });

    // Deployment
    new s3Deployment.BucketDeployment(this, 'CdkReactDeployment', {
      sources: [s3Deployment.Source.asset('../build')],
      destinationBucket: bucket,
    });

    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: 'mertawscdk.tk',
    });

    const cert = new acm.Certificate(this, 'Certificate', {
      domainName: 'mertawscdk.tk',
      subjectAlternativeNames: ['www.mertawscdk.tk'],
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    new cdk.CfnOutput(this, 'CertificateArn', {
      value: cert.certificateArn,
      exportName: 'CertificateArn',
      description: 'Certificate Arn',
    });

    // CloudFront
    const distribution = new cloudfront.Distribution(
      this,
      'CfReactDistribution',
      {
        defaultBehavior: {
          origin: new origins.S3Origin(bucket),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        domainNames: ['mertawscdk.tk', 'www.mertawscdk.tk'],
        certificate: cert,
        minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
        comment: 'cdn mert',
      }
    );

    const distributionRecord = route53.RecordTarget.fromAlias(
      new route53targets.CloudFrontTarget(distribution)
    );

    // Route 53
    new route53.ARecord(this, 'NonWWW', {
      recordName: 'mertawscdk.tk',
      zone: hostedZone,
      target: distributionRecord,
    });

    new route53.ARecord(this, 'WithWWW', {
      recordName: 'www.mertawscdk.tk',
      zone: hostedZone,
      target: distributionRecord,
    });
  }
}
