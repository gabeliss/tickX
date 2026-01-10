import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { RestApi, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { Function } from 'aws-cdk-lib/aws-lambda';
import { APP_NAME } from '../constants';

interface ApiGatewayStackProps extends StackProps {
  eventsLambda: Function;
  listingsLambda: Function;
  venuesLambda: Function;
}

export class ApiGatewayStack extends Stack {
  public readonly api: RestApi;

  constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id, props);

    // Create API Gateway
    this.api = new RestApi(this, 'TickXApi', {
      restApiName: `${APP_NAME}-API`,
      description: 'TickX Marketplace API',
    });

    // API Gateway routes
    const events = this.api.root.addResource('events');
    events.addMethod('GET', new LambdaIntegration(props.eventsLambda));
    events.addResource('{eventId}').addMethod('GET', new LambdaIntegration(props.eventsLambda));

    const venues = this.api.root.addResource('venues');
    venues.addMethod('GET', new LambdaIntegration(props.venuesLambda));
    venues.addResource('{venueId}').addMethod('GET', new LambdaIntegration(props.venuesLambda));

    const listings = this.api.root.addResource('listings');
    listings.addMethod('GET', new LambdaIntegration(props.listingsLambda));
    listings.addMethod('POST', new LambdaIntegration(props.listingsLambda));
    const listingById = listings.addResource('{listingId}');
    listingById.addMethod('GET', new LambdaIntegration(props.listingsLambda));
    listingById.addMethod('PUT', new LambdaIntegration(props.listingsLambda));
    listingById.addMethod('DELETE', new LambdaIntegration(props.listingsLambda));
  }
}