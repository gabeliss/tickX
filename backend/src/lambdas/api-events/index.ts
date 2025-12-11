/**
 * API Events Lambda
 *
 * Handles API Gateway requests for events:
 * - GET /events - List events with filters
 * - GET /events/{eventId} - Get single event
 */

import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  getEvent,
  getEventsByCity,
  getEventsByCategory,
  getEventsByVenue,
  searchEventsSimple,
} from '../../utils/dynamodb';
import { EventCategory, Event } from '../../../../shared/types';

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
  console.log('[API Events] Request:', JSON.stringify({
    path: event.path,
    method: event.httpMethod,
    pathParameters: event.pathParameters,
    queryStringParameters: event.queryStringParameters,
  }));

  try {
    const eventId = event.pathParameters?.eventId;

    // GET /events/{eventId} - Get single event
    if (eventId) {
      const eventData = await getEvent(eventId);

      if (!eventData) {
        return response(404, {
          error: 'Event not found',
          eventId,
        });
      }

      return response(200, { data: eventData });
    }

    // GET /events - List events with filters
    const queryParams = event.queryStringParameters || {};
    const {
      city,
      category,
      venueId,
      dateFrom,
      dateTo,
      pageSize: pageSizeStr,
      cursor,
      keyword,
      q, // Alternative query parameter for search
    } = queryParams;

    const pageSize = Math.min(parseInt(pageSizeStr || '50', 10), 100);
    const searchKeyword = keyword || q;

    // Determine which query to use based on filters
    let result;

    // If keyword search is provided, use search function
    if (searchKeyword) {
      result = await searchEventsSimple(searchKeyword, {
        city,
        category: category && isValidCategory(category) ? category : undefined,
        pageSize,
      });
      return response(200, result);
    }

    if (venueId) {
      // Query by venue
      result = await getEventsByVenue(venueId, {
        dateFrom,
        dateTo,
        pageSize,
        lastKey: cursor,
      });
    } else if (category && isValidCategory(category)) {
      // Query by category
      result = await getEventsByCategory(category, {
        dateFrom,
        dateTo,
        pageSize,
        lastKey: cursor,
      });
    } else if (city) {
      // Query by city (default)
      result = await getEventsByCity(city, {
        dateFrom,
        dateTo,
        pageSize,
        lastKey: cursor,
      });
    } else {
      // Default: return Chicago events (or could return error)
      result = await getEventsByCity('chicago', {
        dateFrom,
        dateTo,
        pageSize,
        lastKey: cursor,
      });
    }

    // If category filter provided with city, filter results
    if (city && category && isValidCategory(category)) {
      result.data = result.data.filter(e => e.category === category);
    }

    return response(200, result);
  } catch (error) {
    console.error('[API Events] Error:', error);

    return response(500, {
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

function isValidCategory(category: string): category is EventCategory {
  return ['concert', 'sports', 'theater', 'festival', 'comedy', 'other'].includes(category);
}
