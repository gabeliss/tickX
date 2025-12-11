/**
 * Ticketmaster Discovery API Client
 *
 * Handles all communication with the Ticketmaster API including:
 * - Rate limiting (5 req/sec, 5000/day)
 * - Pagination handling
 * - Data transformation to TickX format
 */

import {
  TMEvent,
  TMVenue,
  TMSearchResponse,
  Event,
  Venue,
  Attraction,
  EventCategory,
  EventStatus,
  TM_SEGMENT_TO_CATEGORY,
  TM_STATUS_TO_STATUS,
} from '../../../shared/types';

const TM_BASE_URL = 'https://app.ticketmaster.com/discovery/v2';

// Rate limiting: max 5 requests per second
const RATE_LIMIT_DELAY_MS = 220; // ~4.5 req/sec to be safe

// Track last request time for rate limiting
let lastRequestTime = 0;

interface TicketmasterClientConfig {
  apiKey: string;
}

export class TicketmasterClient {
  private apiKey: string;

  constructor(config: TicketmasterClientConfig) {
    this.apiKey = config.apiKey;
  }

  /**
   * Enforce rate limiting between requests
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < RATE_LIMIT_DELAY_MS) {
      await new Promise(resolve =>
        setTimeout(resolve, RATE_LIMIT_DELAY_MS - timeSinceLastRequest)
      );
    }

    lastRequestTime = Date.now();
  }

  /**
   * Make a request to the Ticketmaster API
   */
  private async request<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    await this.rateLimit();

    const url = new URL(`${TM_BASE_URL}${endpoint}`);
    url.searchParams.set('apikey', this.apiKey);

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    }

    console.log(`[TM API] Fetching: ${endpoint}`, params);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[TM API] Error ${response.status}: ${errorBody}`);
      throw new Error(`Ticketmaster API error: ${response.status} - ${errorBody}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Search for events with pagination
   */
  async searchEvents(params: {
    city?: string;
    stateCode?: string;
    countryCode?: string;
    keyword?: string;
    classificationName?: string;
    startDateTime?: string;
    endDateTime?: string;
    size?: number;
    page?: number;
    sort?: string;
  }): Promise<{ events: TMEvent[]; page: TMSearchResponse['page'] }> {
    const response = await this.request<TMSearchResponse>('/events.json', {
      city: params.city || '',
      stateCode: params.stateCode || '',
      countryCode: params.countryCode || 'US',
      keyword: params.keyword || '',
      classificationName: params.classificationName || '',
      startDateTime: params.startDateTime || '',
      endDateTime: params.endDateTime || '',
      size: String(params.size || 200),
      page: String(params.page || 0),
      sort: params.sort || 'date,asc',
    });

    return {
      events: response._embedded?.events || [],
      page: response.page,
    };
  }

  /**
   * Get all events for a city, handling pagination
   * Uses date ranges to work around the 1000-item deep paging limit
   */
  async getAllEventsForCity(city: string, stateCode: string): Promise<TMEvent[]> {
    const allEvents: TMEvent[] = [];
    const seenIds = new Set<string>();

    // Get events for the next 6 months in 1-month chunks to avoid deep paging limits
    const now = new Date();

    for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
      const startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() + monthOffset);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0); // Last day of month
      endDate.setHours(23, 59, 59, 0);

      // Format dates for TM API (ISO 8601 with Z suffix, no milliseconds)
      // Format: YYYY-MM-DDTHH:mm:ssZ
      const formatDate = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, 'Z');
      const startDateTime = formatDate(startDate);
      const endDateTime = formatDate(endDate);

      console.log(`[TM API] Fetching ${city}, ${stateCode} events: ${startDate.toISOString().slice(0, 10)} to ${endDate.toISOString().slice(0, 10)}`);

      let page = 0;
      let hasMore = true;

      while (hasMore) {
        try {
          const result = await this.searchEvents({
            city,
            stateCode,
            startDateTime,
            endDateTime,
            page,
            size: 200, // Max allowed
          });

          for (const event of result.events) {
            if (!seenIds.has(event.id)) {
              seenIds.add(event.id);
              allEvents.push(event);
            }
          }

          const totalPages = result.page?.totalPages || 0;
          page++;

          // Deep paging limit: size * page must be < 1000
          // With size=200, max page is 4 (0-4 = 5 pages = 1000 items)
          hasMore = page < totalPages && page < 5;

          console.log(`[TM API] Page ${page - 1}/${totalPages}, got ${result.events.length} events, total: ${allEvents.length}`);
        } catch (error) {
          console.error(`[TM API] Error fetching page ${page}:`, error);
          hasMore = false;
        }
      }
    }

    console.log(`[TM API] Total events for ${city}, ${stateCode}: ${allEvents.length}`);
    return allEvents;
  }

  /**
   * Search for venues
   */
  async searchVenues(params: {
    city?: string;
    stateCode?: string;
    countryCode?: string;
    keyword?: string;
    size?: number;
    page?: number;
  }): Promise<{ venues: TMVenue[]; page: TMSearchResponse['page'] }> {
    const response = await this.request<TMSearchResponse>('/venues.json', {
      city: params.city || '',
      stateCode: params.stateCode || '',
      countryCode: params.countryCode || 'US',
      keyword: params.keyword || '',
      size: String(params.size || 200),
      page: String(params.page || 0),
    });

    return {
      venues: response._embedded?.venues || [],
      page: response.page,
    };
  }

  /**
   * Get a single event by ID
   */
  async getEvent(eventId: string): Promise<TMEvent | null> {
    try {
      return await this.request<TMEvent>(`/events/${eventId}.json`);
    } catch (error) {
      console.error(`[TM API] Failed to get event ${eventId}:`, error);
      return null;
    }
  }

  /**
   * Get a single venue by ID
   */
  async getVenue(venueId: string): Promise<TMVenue | null> {
    try {
      return await this.request<TMVenue>(`/venues/${venueId}.json`);
    } catch (error) {
      console.error(`[TM API] Failed to get venue ${venueId}:`, error);
      return null;
    }
  }
}

// =============================================================================
// DATA TRANSFORMATION FUNCTIONS
// =============================================================================

/**
 * Select the best image from available images
 * Prefers 16:9 ratio, larger sizes
 */
function selectBestImage(images?: TMEvent['images']): { imageUrl: string; thumbnailUrl?: string } {
  if (!images || images.length === 0) {
    return { imageUrl: '' };
  }

  // Sort by quality: prefer 16_9, non-fallback, larger width
  const sorted = [...images].sort((a, b) => {
    // Prefer non-fallback images
    if (a.fallback !== b.fallback) {
      return a.fallback ? 1 : -1;
    }
    // Prefer 16:9 ratio
    if (a.ratio !== b.ratio) {
      if (a.ratio === '16_9') return -1;
      if (b.ratio === '16_9') return 1;
    }
    // Prefer larger images
    return (b.width || 0) - (a.width || 0);
  });

  const best = sorted[0];

  // Find a smaller image for thumbnail (around 300-500px wide)
  const thumbnail = sorted.find(img =>
    (img.width || 0) >= 300 && (img.width || 0) <= 500
  ) || sorted[sorted.length - 1];

  return {
    imageUrl: best.url || '',
    thumbnailUrl: thumbnail?.url,
  };
}

/**
 * Transform Ticketmaster event to TickX Event format
 */
export function transformTMEvent(tmEvent: TMEvent): Event | null {
  // Skip events without required data
  if (!tmEvent.id || !tmEvent.name) {
    return null;
  }

  const venue = tmEvent._embedded?.venues?.[0];
  if (!venue) {
    console.warn(`[Transform] Skipping event ${tmEvent.id}: no venue`);
    return null;
  }

  const dates = tmEvent.dates;
  if (!dates?.start?.localDate) {
    console.warn(`[Transform] Skipping event ${tmEvent.id}: no date`);
    return null;
  }

  // Get classification
  const primaryClassification = tmEvent.classifications?.find(c => c.primary);
  const segment = primaryClassification?.segment?.name || 'Miscellaneous';
  const category: EventCategory = TM_SEGMENT_TO_CATEGORY[segment] || 'other';

  // Get status
  const tmStatus = dates.status?.code || 'onsale';
  const status: EventStatus = TM_STATUS_TO_STATUS[tmStatus] || 'scheduled';

  // Get pricing
  const priceRange = tmEvent.priceRanges?.find(p => p.type === 'standard') || tmEvent.priceRanges?.[0];

  // Get images
  const { imageUrl, thumbnailUrl } = selectBestImage(tmEvent.images);

  // Transform attractions
  const attractions: Attraction[] = (tmEvent._embedded?.attractions || []).map(a => ({
    id: a.id,
    name: a.name,
    type: a.type,
    imageUrl: a.images?.[0]?.url,
    url: a.url,
  }));

  // Build event datetime
  let eventDate = dates.start.localDate;
  if (dates.start.localTime) {
    eventDate = `${dates.start.localDate}T${dates.start.localTime}`;
  } else if (dates.start.dateTime) {
    eventDate = dates.start.dateTime;
  }

  const now = new Date().toISOString();

  return {
    id: tmEvent.id,
    name: tmEvent.name,
    description: tmEvent.description || tmEvent.info,
    category,
    status,

    // Date & Time
    eventDate,
    localDate: dates.start.localDate,
    localTime: dates.start.localTime,
    timezone: dates.timezone || venue.timezone || 'America/New_York',
    doorTime: dates.doorTime?.localTime,
    endDate: dates.end?.dateTime,

    // Venue (denormalized)
    venueId: venue.id,
    venueName: venue.name,
    venueCity: venue.city?.name || '',
    venueState: venue.state?.name || '',
    venueStateCode: venue.state?.stateCode || '',

    // Images
    imageUrl,
    thumbnailUrl,
    images: tmEvent.images?.map(img => ({
      url: img.url || '',
      width: img.width || 0,
      height: img.height || 0,
      ratio: img.ratio,
      fallback: img.fallback,
    })),

    // Pricing
    minPrice: priceRange?.min,
    maxPrice: priceRange?.max,
    currency: priceRange?.currency || 'USD',

    // Attractions
    attractions,

    // Classifications
    segment: primaryClassification?.segment?.name,
    genre: primaryClassification?.genre?.name,
    subGenre: primaryClassification?.subGenre?.name,

    // Metadata
    url: tmEvent.url,
    seatmapUrl: tmEvent.seatmap?.staticUrl,
    pleaseNote: tmEvent.pleaseNote,
    ticketLimit: tmEvent.ticketLimit?.info ? parseInt(tmEvent.ticketLimit.info) || undefined : undefined,

    // TickX specific
    isFeatured: false,
    listingCount: 0,

    // DynamoDB metadata
    createdAt: now,
    updatedAt: now,
    source: 'ticketmaster',
  };
}

/**
 * Transform Ticketmaster venue to TickX Venue format
 */
export function transformTMVenue(tmVenue: TMVenue): Venue | null {
  if (!tmVenue.id || !tmVenue.name) {
    return null;
  }

  const now = new Date().toISOString();

  // Get best image
  const image = tmVenue.images?.find(i => i.ratio === '16_9') || tmVenue.images?.[0];

  return {
    id: tmVenue.id,
    name: tmVenue.name,
    address: [tmVenue.address?.line1, tmVenue.address?.line2].filter(Boolean).join(', ') || '',
    city: tmVenue.city?.name || '',
    state: tmVenue.state?.name || '',
    stateCode: tmVenue.state?.stateCode || '',
    country: tmVenue.country?.name || 'United States',
    countryCode: tmVenue.country?.countryCode || 'US',
    postalCode: tmVenue.postalCode || '',
    timezone: tmVenue.timezone || 'America/New_York',
    latitude: tmVenue.location?.latitude ? parseFloat(tmVenue.location.latitude) : undefined,
    longitude: tmVenue.location?.longitude ? parseFloat(tmVenue.location.longitude) : undefined,
    imageUrl: image?.url,
    url: tmVenue.url,
    parkingInfo: tmVenue.parkingDetail,
    boxOfficeInfo: tmVenue.boxOfficeInfo?.phoneNumberDetail,
    generalInfo: tmVenue.generalInfo?.generalRule,
    createdAt: now,
    updatedAt: now,
    source: 'ticketmaster',
  };
}
