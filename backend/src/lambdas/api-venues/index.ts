/**
 * API Venues Lambda
 *
 * Handles API Gateway requests for venues:
 * - GET /venues - List venues with filters
 * - GET /venues/{venueId} - Get single venue
 */

import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getVenue, getVenuesByCity } from '../../utils/dynamodb';

// CORS headers
const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
};

function response(statusCode: number, body: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  console.log('[API Venues] Request:', JSON.stringify({
    path: event.path,
    method: event.httpMethod,
    pathParameters: event.pathParameters,
    queryStringParameters: event.queryStringParameters,
  }));

  try {
    const venueId = event.pathParameters?.venueId;

    // GET /venues/{venueId} - Get single venue
    if (venueId) {
      const venue = await getVenue(venueId);

      if (!venue) {
        return response(404, {
          error: 'Venue not found',
          venueId,
        });
      }

      return response(200, { data: venue });
    }

    // GET /venues - List venues with filters
    const queryParams = event.queryStringParameters || {};
    const { city, pageSize: pageSizeStr, cursor } = queryParams;

    const pageSize = Math.min(parseInt(pageSizeStr || '50', 10), 100);

    if (!city) {
      return response(400, {
        error: 'Missing required parameter: city',
        example: '/venues?city=chicago',
      });
    }

    const result = await getVenuesByCity(city, {
      pageSize,
      lastKey: cursor,
    });

    return response(200, result);
  } catch (error) {
    console.error('[API Venues] Error:', error);

    return response(500, {
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
