import * as cdk from '@aws-cdk/core';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as route53 from '@aws-cdk/aws-route53';

export class CertificateManagerStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const hostedZone = route53.HostedZone.fromLookup(this, 'MyZone', {
      domainName: 'mertawscdk.tk',
    });

    // Alternative way
    /*
    const myCertificate = new acm.DnsValidatedCertificate(this, 'Certificate', {
      domainName: 'mertawscdk.tk',
      hostedZone,
      region: 'region: "us-east-1",'
    });
    */

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
  }
}
