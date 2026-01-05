import { Stack, StackProps } from 'aws-cdk-lib';
import { Vpc, SubnetType } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { VPC_MAX_AZS, VPC_NAT_GATEWAYS, VPC_CIDR_MASK } from '../constants';

export class VpcStack extends Stack {
  public readonly vpc: Vpc;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.vpc = new Vpc(this, 'TickXVpc', {
      maxAzs: VPC_MAX_AZS,
      natGateways: VPC_NAT_GATEWAYS,
      subnetConfiguration: [
        {
          cidrMask: VPC_CIDR_MASK,
          name: 'Public',
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: VPC_CIDR_MASK,
          name: 'Private',
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });
  }
}