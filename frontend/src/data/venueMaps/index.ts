/**
 * Venue Maps Index
 *
 * Central export for all venue map configurations.
 * Uses a generic arena template that can be customized per venue.
 */

import type { VenueMapConfig } from '../../types/venueMap';
import { createGenericArenaMap } from './genericArena';

/**
 * Pre-configured arena maps for each venue.
 * All use the same realistic arena template with venue-specific labels.
 */
const staplesCenterMap = createGenericArenaMap(
  'venue-3',
  'Crypto.com Arena',
  'COURT'
);

const madisonSquareGardenMap = createGenericArenaMap(
  'venue-1',
  'Madison Square Garden',
  'COURT'
);

const barclaysCenterMap = createGenericArenaMap(
  'venue-2',
  'Barclays Center',
  'STAGE'
);

const sofiStadiumMap = createGenericArenaMap(
  'venue-4',
  'SoFi Stadium',
  'FIELD'
);

const chaseCenterMap = createGenericArenaMap(
  'venue-5',
  'Chase Center',
  'COURT'
);

/**
 * Map of venue ID to venue map configuration.
 * All mock venues now have map support.
 */
export const venueMaps: Record<string, VenueMapConfig> = {
  'venue-1': madisonSquareGardenMap,
  'venue-2': barclaysCenterMap,
  'venue-3': staplesCenterMap,
  'venue-4': sofiStadiumMap,
  'venue-5': chaseCenterMap,
};

/**
 * Get venue map configuration by venue ID.
 *
 * @param venueId - The venue ID to look up
 * @returns The venue map config or undefined if not available
 */
export function getVenueMap(venueId: string): VenueMapConfig | undefined {
  return venueMaps[venueId];
}

/**
 * Check if a venue has an interactive map available.
 *
 * @param venueId - The venue ID to check
 * @returns True if venue has a map configuration
 */
export function hasVenueMap(venueId: string): boolean {
  return venueId in venueMaps;
}

export { createGenericArenaMap };
export { staplesCenterMap, madisonSquareGardenMap, barclaysCenterMap, sofiStadiumMap, chaseCenterMap };
