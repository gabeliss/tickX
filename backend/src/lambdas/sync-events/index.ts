/**
 * Sync Events Lambda
 *
 * Fetches events from Ticketmaster API for configured cities
 * and saves them to DynamoDB. Also extracts and saves venues.
 *
 * Triggered:
 * - Scheduled: Every hour via EventBridge
 * - Manual: Can invoke directly for initial sync
 */

import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import {
  TicketmasterClient,
  transformTMEvent,
  transformTMVenue,
} from '../../utils/ticketmaster';
import { saveEventsBatch, saveVenuesBatch } from '../../utils/dynamodb';
import { Event, Venue } from '../../../../shared/types';

// Cities to sync (Chicago and New York)
const CITIES_TO_SYNC = [
  { city: 'Chicago', stateCode: 'IL' },
  { city: 'New York', stateCode: 'NY' },
];

// SSM client for fetching API key
const ssmClient = new SSMClient({});

interface SyncResult {
  city: string;
  eventsFound: number;
  eventsSaved: number;
  eventsFailed: number;
  venuesFound: number;
  venuesSaved: number;
}

async function getTicketmasterApiKey(): Promise<string> {
  const paramName = process.env.TM_API_KEY_PARAM || '/tickx/ticketmaster-api-key';

  try {
    const response = await ssmClient.send(
      new GetParameterCommand({
        Name: paramName,
        WithDecryption: true,
      })
    );

    if (!response.Parameter?.Value) {
      throw new Error(`SSM parameter ${paramName} has no value`);
    }

    return response.Parameter.Value;
  } catch (error) {
    console.error('[Sync] Failed to get Ticketmaster API key from SSM:', error);
    throw error;
  }
}

async function syncCity(
  client: TicketmasterClient,
  city: string,
  stateCode: string
): Promise<SyncResult> {
  console.log(`[Sync] Starting sync for ${city}, ${stateCode}`);

  const result: SyncResult = {
    city: `${city}, ${stateCode}`,
    eventsFound: 0,
    eventsSaved: 0,
    eventsFailed: 0,
    venuesFound: 0,
    venuesSaved: 0,
  };

  try {
    // Fetch all events from Ticketmaster
    const tmEvents = await client.getAllEventsForCity(city, stateCode);
    result.eventsFound = tmEvents.length;

    if (tmEvents.length === 0) {
      console.log(`[Sync] No events found for ${city}, ${stateCode}`);
      return result;
    }

    // Transform events and extract venues
    const events: Event[] = [];
    const venuesMap = new Map<string, Venue>();

    for (const tmEvent of tmEvents) {
      // Transform event
      const event = transformTMEvent(tmEvent);
      if (event) {
        events.push(event);
      }

      // Extract and transform venue
      const tmVenue = tmEvent._embedded?.venues?.[0];
      if (tmVenue && !venuesMap.has(tmVenue.id)) {
        const venue = transformTMVenue(tmVenue);
        if (venue) {
          venuesMap.set(venue.id, venue);
        }
      }
    }

    const venues = Array.from(venuesMap.values());
    result.venuesFound = venues.length;

    console.log(`[Sync] Transformed ${events.length} events and ${venues.length} venues`);

    // Save venues first (events reference venues)
    if (venues.length > 0) {
      await saveVenuesBatch(venues);
      result.venuesSaved = venues.length;
      console.log(`[Sync] Saved ${venues.length} venues`);
    }

    // Save events in batches
    if (events.length > 0) {
      const { saved, failed } = await saveEventsBatch(events);
      result.eventsSaved = saved;
      result.eventsFailed = failed;
      console.log(`[Sync] Saved ${saved} events, ${failed} failed`);
    }

    return result;
  } catch (error) {
    console.error(`[Sync] Error syncing ${city}, ${stateCode}:`, error);
    throw error;
  }
}

export async function handler(event: unknown): Promise<{
  statusCode: number;
  body: string;
}> {
  console.log('[Sync] Lambda invoked', JSON.stringify(event));

  const startTime = Date.now();
  const results: SyncResult[] = [];

  try {
    // Get API key from SSM
    const apiKey = await getTicketmasterApiKey();
    const client = new TicketmasterClient({ apiKey });

    // Sync each city
    for (const { city, stateCode } of CITIES_TO_SYNC) {
      try {
        const result = await syncCity(client, city, stateCode);
        results.push(result);
      } catch (error) {
        console.error(`[Sync] Failed to sync ${city}, ${stateCode}:`, error);
        results.push({
          city: `${city}, ${stateCode}`,
          eventsFound: 0,
          eventsSaved: 0,
          eventsFailed: 0,
          venuesFound: 0,
          venuesSaved: 0,
        });
      }
    }

    const duration = Date.now() - startTime;
    const totalEvents = results.reduce((sum, r) => sum + r.eventsSaved, 0);
    const totalVenues = results.reduce((sum, r) => sum + r.venuesSaved, 0);

    console.log(`[Sync] Completed in ${duration}ms`);
    console.log(`[Sync] Total: ${totalEvents} events, ${totalVenues} venues`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Sync completed',
        duration: `${duration}ms`,
        results,
        totals: {
          events: totalEvents,
          venues: totalVenues,
        },
      }),
    };
  } catch (error) {
    console.error('[Sync] Fatal error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Sync failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
}
