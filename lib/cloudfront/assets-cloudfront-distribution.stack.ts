import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as route53 from '@aws-cdk/aws-route53';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as route53targets from '@aws-cdk/aws-route53-targets';
import * as origins from '@aws-cdk/aws-cloudfront-origins';

import { getAppEnv, getConfig } from '../config';

export class AssetsCloudfrontDistributionStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const appEnv = getAppEnv();
    const conf = getConfig(this, appEnv);

    const assetsBucket = s3.Bucket.fromBucketAttributes(this, 'AssetsBucket', {
      bucketArn: conf.assetsBucket.arn,
      bucketName: conf.assetsBucket.name,
      region: conf.assetsBucket.region,
      bucketRegionalDomainName: conf.assetsBucket.regionalDomainName,
    });

    const cert = acm.Certificate.fromCertificateArn(
      this,
      'MertCert',
      cdk.Fn.importValue('CertificateArn')
    );

    const recordName = appEnv == 'prod' ? 'cdn' : `${appEnv}-cdn`;

    const distribution = new cloudfront.Distribution(
      this,
      'AssetsDistribution',
      {
        defaultBehavior: {
          origin: new origins.S3Origin(assetsBucket),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        domainNames: ['mertawscdk.tk', 'www.mertawscdk.tk'],
        certificate: cert,
        minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
        comment: 'cdn mertdogan',
      }
    );

    const hostedZone = route53.HostedZone.fromLookup(this, 'MyZone', {
      domainName: 'mertawscdk.tk',
    });

    const distributionRecord = route53.RecordTarget.fromAlias(
      new route53targets.CloudFrontTarget(distribution)
    );

    new route53.ARecord(this, 'CdnRecord', {
      recordName: 'mertawscdk.tk',
      zone: hostedZone,
      target: distributionRecord,
      comment: `${recordName} distribution record`,
    });

    new route53.ARecord(this, 'CdnRecordW', {
      recordName: 'www.mertawscdk.tk',
      zone: hostedZone,
      target: distributionRecord,
      comment: `www.${recordName} distribution record`,
    });
  }
}
