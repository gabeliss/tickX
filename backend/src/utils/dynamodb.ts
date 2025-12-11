/**
 * DynamoDB Utilities
 *
 * Handles all DynamoDB operations for events and venues
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  BatchWriteCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  Event,
  Venue,
  EventItem,
  VenueItem,
  PaginatedResponse,
  EventSearchParams,
  VenueSearchParams,
} from '../../../shared/types';

// Initialize DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

// Table names from environment
const EVENTS_TABLE = process.env.EVENTS_TABLE || 'TickX-Events';
const VENUES_TABLE = process.env.VENUES_TABLE || 'TickX-Venues';

// =============================================================================
// KEY BUILDERS
// =============================================================================

export function buildEventKeys(event: Event): Omit<EventItem, 'data' | 'entityType'> {
  return {
    PK: `EVENT#${event.id}`,
    SK: `EVENT#${event.id}`,
    // GSI1: Query events by city + date
    GSI1PK: `CITY#${event.venueCity.toLowerCase().replace(/\s+/g, '_')}`,
    GSI1SK: `DATE#${event.localDate}#EVENT#${event.id}`,
    // GSI2: Query events by category + date
    GSI2PK: `CATEGORY#${event.category}`,
    GSI2SK: `DATE#${event.localDate}#EVENT#${event.id}`,
    // GSI3: Query events by venue + date
    GSI3PK: `VENUE#${event.venueId}`,
    GSI3SK: `DATE#${event.localDate}#EVENT#${event.id}`,
  };
}

export function buildVenueKeys(venue: Venue): Omit<VenueItem, 'data' | 'entityType'> {
  return {
    PK: `VENUE#${venue.id}`,
    SK: `VENUE#${venue.id}`,
    // GSI1: Query venues by city
    GSI1PK: `CITY#${venue.city.toLowerCase().replace(/\s+/g, '_')}`,
    GSI1SK: `VENUE#${venue.id}`,
  };
}

// =============================================================================
// VENUE OPERATIONS
// =============================================================================

/**
 * Save a venue to DynamoDB
 */
export async function saveVenue(venue: Venue): Promise<void> {
  const item: VenueItem = {
    ...buildVenueKeys(venue),
    entityType: 'VENUE',
    data: venue,
  };

  await docClient.send(
    new PutCommand({
      TableName: VENUES_TABLE,
      Item: item,
    })
  );
}

/**
 * Save multiple venues in batch
 */
export async function saveVenuesBatch(venues: Venue[]): Promise<void> {
  // DynamoDB batch write limit is 25 items
  const batches: Venue[][] = [];
  for (let i = 0; i < venues.length; i += 25) {
    batches.push(venues.slice(i, i + 25));
  }

  for (const batch of batches) {
    const writeRequests = batch.map(venue => ({
      PutRequest: {
        Item: {
          ...buildVenueKeys(venue),
          entityType: 'VENUE',
          data: venue,
        },
      },
    }));

    await docClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [VENUES_TABLE]: writeRequests,
        },
      })
    );
  }
}

/**
 * Get a venue by ID
 */
export async function getVenue(venueId: string): Promise<Venue | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: VENUES_TABLE,
      Key: {
        PK: `VENUE#${venueId}`,
        SK: `VENUE#${venueId}`,
      },
    })
  );

  return (result.Item as VenueItem)?.data || null;
}

/**
 * Get venues by city
 */
export async function getVenuesByCity(
  city: string,
  params: { pageSize?: number; lastKey?: string } = {}
): Promise<PaginatedResponse<Venue>> {
  const pageSize = params.pageSize || 50;
  const cityKey = city.toLowerCase().replace(/\s+/g, '_');

  const result = await docClient.send(
    new QueryCommand({
      TableName: VENUES_TABLE,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `CITY#${cityKey}`,
      },
      Limit: pageSize,
      ExclusiveStartKey: params.lastKey
        ? JSON.parse(Buffer.from(params.lastKey, 'base64').toString())
        : undefined,
    })
  );

  const venues = (result.Items as VenueItem[])?.map(item => item.data) || [];

  return {
    data: venues,
    pagination: {
      page: 0,
      pageSize,
      totalItems: venues.length,
      totalPages: 1,
      hasMore: !!result.LastEvaluatedKey,
    },
  };
}

// =============================================================================
// EVENT OPERATIONS
// =============================================================================

/**
 * Save an event to DynamoDB
 */
export async function saveEvent(event: Event): Promise<void> {
  const item: EventItem = {
    ...buildEventKeys(event),
    entityType: 'EVENT',
    data: event,
  };

  await docClient.send(
    new PutCommand({
      TableName: EVENTS_TABLE,
      Item: item,
    })
  );
}

/**
 * Save multiple events in batch
 */
export async function saveEventsBatch(events: Event[]): Promise<{ saved: number; failed: number }> {
  let saved = 0;
  let failed = 0;

  // DynamoDB batch write limit is 25 items
  const batches: Event[][] = [];
  for (let i = 0; i < events.length; i += 25) {
    batches.push(events.slice(i, i + 25));
  }

  for (const batch of batches) {
    try {
      const writeRequests = batch.map(event => ({
        PutRequest: {
          Item: {
            ...buildEventKeys(event),
            entityType: 'EVENT',
            data: event,
          },
        },
      }));

      await docClient.send(
        new BatchWriteCommand({
          RequestItems: {
            [EVENTS_TABLE]: writeRequests,
          },
        })
      );

      saved += batch.length;
    } catch (error) {
      console.error('[DynamoDB] Batch write failed:', error);
      failed += batch.length;
    }
  }

  return { saved, failed };
}

/**
 * Get an event by ID
 */
export async function getEvent(eventId: string): Promise<Event | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: EVENTS_TABLE,
      Key: {
        PK: `EVENT#${eventId}`,
        SK: `EVENT#${eventId}`,
      },
    })
  );

  return (result.Item as EventItem)?.data || null;
}

/**
 * Query events by city and date range
 */
export async function getEventsByCity(
  city: string,
  params: {
    dateFrom?: string;
    dateTo?: string;
    pageSize?: number;
    lastKey?: string;
  } = {}
): Promise<PaginatedResponse<Event>> {
  const pageSize = params.pageSize || 50;
  const cityKey = city.toLowerCase().replace(/\s+/g, '_');

  // Build date range condition
  const today = new Date().toISOString().slice(0, 10);
  const dateFrom = params.dateFrom || today;
  const dateTo = params.dateTo || '2099-12-31';

  const result = await docClient.send(
    new QueryCommand({
      TableName: EVENTS_TABLE,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk AND GSI1SK BETWEEN :skStart AND :skEnd',
      ExpressionAttributeValues: {
        ':pk': `CITY#${cityKey}`,
        ':skStart': `DATE#${dateFrom}`,
        ':skEnd': `DATE#${dateTo}#EVENT#zzz`,
      },
      Limit: pageSize,
      ExclusiveStartKey: params.lastKey
        ? JSON.parse(Buffer.from(params.lastKey, 'base64').toString())
        : undefined,
    })
  );

  const events = (result.Items as EventItem[])?.map(item => item.data) || [];

  return {
    data: events,
    pagination: {
      page: 0,
      pageSize,
      totalItems: events.length,
      totalPages: 1,
      hasMore: !!result.LastEvaluatedKey,
    },
  };
}

/**
 * Query events by category and date range
 */
export async function getEventsByCategory(
  category: string,
  params: {
    dateFrom?: string;
    dateTo?: string;
    pageSize?: number;
    lastKey?: string;
  } = {}
): Promise<PaginatedResponse<Event>> {
  const pageSize = params.pageSize || 50;

  const today = new Date().toISOString().slice(0, 10);
  const dateFrom = params.dateFrom || today;
  const dateTo = params.dateTo || '2099-12-31';

  const result = await docClient.send(
    new QueryCommand({
      TableName: EVENTS_TABLE,
      IndexName: 'GSI2',
      KeyConditionExpression: 'GSI2PK = :pk AND GSI2SK BETWEEN :skStart AND :skEnd',
      ExpressionAttributeValues: {
        ':pk': `CATEGORY#${category}`,
        ':skStart': `DATE#${dateFrom}`,
        ':skEnd': `DATE#${dateTo}#EVENT#zzz`,
      },
      Limit: pageSize,
      ExclusiveStartKey: params.lastKey
        ? JSON.parse(Buffer.from(params.lastKey, 'base64').toString())
        : undefined,
    })
  );

  const events = (result.Items as EventItem[])?.map(item => item.data) || [];

  return {
    data: events,
    pagination: {
      page: 0,
      pageSize,
      totalItems: events.length,
      totalPages: 1,
      hasMore: !!result.LastEvaluatedKey,
    },
  };
}

/**
 * Query events by venue and date range
 */
export async function getEventsByVenue(
  venueId: string,
  params: {
    dateFrom?: string;
    dateTo?: string;
    pageSize?: number;
    lastKey?: string;
  } = {}
): Promise<PaginatedResponse<Event>> {
  const pageSize = params.pageSize || 50;

  const today = new Date().toISOString().slice(0, 10);
  const dateFrom = params.dateFrom || today;
  const dateTo = params.dateTo || '2099-12-31';

  const result = await docClient.send(
    new QueryCommand({
      TableName: EVENTS_TABLE,
      IndexName: 'GSI3',
      KeyConditionExpression: 'GSI3PK = :pk AND GSI3SK BETWEEN :skStart AND :skEnd',
      ExpressionAttributeValues: {
        ':pk': `VENUE#${venueId}`,
        ':skStart': `DATE#${dateFrom}`,
        ':skEnd': `DATE#${dateTo}#EVENT#zzz`,
      },
      Limit: pageSize,
      ExclusiveStartKey: params.lastKey
        ? JSON.parse(Buffer.from(params.lastKey, 'base64').toString())
        : undefined,
    })
  );

  const events = (result.Items as EventItem[])?.map(item => item.data) || [];

  return {
    data: events,
    pagination: {
      page: 0,
      pageSize,
      totalItems: events.length,
      totalPages: 1,
      hasMore: !!result.LastEvaluatedKey,
    },
  };
}

/**
 * Update event listing count
 */
export async function updateEventListingCount(
  eventId: string,
  listingCount: number
): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: EVENTS_TABLE,
      Key: {
        PK: `EVENT#${eventId}`,
        SK: `EVENT#${eventId}`,
      },
      UpdateExpression: 'SET #data.listingCount = :count, #data.updatedAt = :now',
      ExpressionAttributeNames: {
        '#data': 'data',
      },
      ExpressionAttributeValues: {
        ':count': listingCount,
        ':now': new Date().toISOString(),
      },
    })
  );
}

/**
 * Mark event as featured
 */
export async function setEventFeatured(
  eventId: string,
  isFeatured: boolean
): Promise<void> {
  await docClient.send(
    new UpdateCommand({
      TableName: EVENTS_TABLE,
      Key: {
        PK: `EVENT#${eventId}`,
        SK: `EVENT#${eventId}`,
      },
      UpdateExpression: 'SET #data.isFeatured = :featured, #data.updatedAt = :now',
      ExpressionAttributeNames: {
        '#data': 'data',
      },
      ExpressionAttributeValues: {
        ':featured': isFeatured,
        ':now': new Date().toISOString(),
      },
    })
  );
}
