/**
 * TickX Shared Types
 * Used by both frontend and backend
 */

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

export type EventCategory = 'concert' | 'sports' | 'theater' | 'festival' | 'comedy' | 'other';

export type EventStatus = 'scheduled' | 'postponed' | 'cancelled' | 'rescheduled';

// Ticketmaster category mapping
export const TM_SEGMENT_TO_CATEGORY: Record<string, EventCategory> = {
  'Music': 'concert',
  'Sports': 'sports',
  'Arts & Theatre': 'theater',
  'Film': 'other',
  'Miscellaneous': 'other',
  'Comedy': 'comedy',
  'Festival': 'festival',
};

// Ticketmaster status mapping
export const TM_STATUS_TO_STATUS: Record<string, EventStatus> = {
  'onsale': 'scheduled',
  'offsale': 'scheduled',
  'cancelled': 'cancelled',
  'postponed': 'postponed',
  'rescheduled': 'rescheduled',
};

// =============================================================================
// VENUE
// =============================================================================

export interface Venue {
  id: string;                    // Ticketmaster venue ID
  name: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  country: string;
  countryCode: string;
  postalCode: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  imageUrl?: string;
  url?: string;                  // Ticketmaster venue URL
  parkingInfo?: string;
  boxOfficeInfo?: string;
  generalInfo?: string;
  // DynamoDB metadata
  createdAt: string;
  updatedAt: string;
  source: 'ticketmaster';
}

// DynamoDB item format for Venue
export interface VenueItem {
  PK: string;                    // VENUE#{venueId}
  SK: string;                    // VENUE#{venueId}
  GSI1PK?: string;               // CITY#{city}
  GSI1SK?: string;               // VENUE#{venueId}
  entityType: 'VENUE';
  data: Venue;
}

// =============================================================================
// EVENT
// =============================================================================

export interface Event {
  id: string;                    // Ticketmaster event ID
  name: string;
  description?: string;
  category: EventCategory;
  status: EventStatus;

  // Date & Time
  eventDate: string;             // ISO 8601 datetime
  localDate: string;             // YYYY-MM-DD
  localTime?: string;            // HH:MM:SS
  timezone: string;
  doorTime?: string;
  endDate?: string;

  // Venue (denormalized for fast reads)
  venueId: string;
  venueName: string;
  venueCity: string;
  venueState: string;
  venueStateCode: string;

  // Images
  imageUrl: string;              // Best available image
  thumbnailUrl?: string;         // Smaller image for lists
  images?: EventImage[];         // All available images

  // Pricing (from Ticketmaster, if available)
  minPrice?: number;
  maxPrice?: number;
  currency?: string;

  // Attractions (artists, teams, performers)
  attractions?: Attraction[];

  // Classifications
  segment?: string;              // e.g., "Music"
  genre?: string;                // e.g., "Rock"
  subGenre?: string;             // e.g., "Alternative Rock"

  // Metadata
  url?: string;                  // Ticketmaster event URL
  seatmapUrl?: string;           // Static seatmap image
  pleaseNote?: string;           // Important event notes
  ticketLimit?: number;
  ageRestriction?: string;

  // TickX specific
  isFeatured?: boolean;
  listingCount?: number;         // Number of TickX listings

  // DynamoDB metadata
  createdAt: string;
  updatedAt: string;
  source: 'ticketmaster';
}

export interface EventImage {
  url: string;
  width: number;
  height: number;
  ratio?: string;                // "16_9", "3_2", "4_3"
  fallback?: boolean;
}

export interface Attraction {
  id: string;
  name: string;
  type?: string;                 // "artist", "team", etc.
  imageUrl?: string;
  url?: string;
}

// DynamoDB item format for Event
export interface EventItem {
  PK: string;                    // EVENT#{eventId}
  SK: string;                    // EVENT#{eventId}
  GSI1PK?: string;               // CITY#{city}
  GSI1SK?: string;               // DATE#{localDate}#EVENT#{eventId}
  GSI2PK?: string;               // CATEGORY#{category}
  GSI2SK?: string;               // DATE#{localDate}#EVENT#{eventId}
  GSI3PK?: string;               // VENUE#{venueId}
  GSI3SK?: string;               // DATE#{localDate}#EVENT#{eventId}
  entityType: 'EVENT';
  data: Event;
}

// =============================================================================
// API TYPES
// =============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface EventSearchParams {
  city?: string;
  category?: EventCategory;
  venueId?: string;
  dateFrom?: string;             // YYYY-MM-DD
  dateTo?: string;               // YYYY-MM-DD
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface VenueSearchParams {
  city?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

// =============================================================================
// TICKETMASTER API RESPONSE TYPES
// =============================================================================

export interface TMEvent {
  id: string;
  name: string;
  type: string;
  url?: string;
  locale?: string;
  description?: string;
  pleaseNote?: string;
  info?: string;
  dates?: {
    start?: {
      localDate?: string;
      localTime?: string;
      dateTime?: string;
      dateTBD?: boolean;
      dateTBA?: boolean;
      timeTBA?: boolean;
      noSpecificTime?: boolean;
    };
    end?: {
      localDate?: string;
      localTime?: string;
      dateTime?: string;
    };
    timezone?: string;
    status?: {
      code?: string;
    };
    doorTime?: {
      localTime?: string;
    };
  };
  classifications?: Array<{
    primary?: boolean;
    segment?: { id?: string; name?: string };
    genre?: { id?: string; name?: string };
    subGenre?: { id?: string; name?: string };
  }>;
  priceRanges?: Array<{
    type?: string;
    currency?: string;
    min?: number;
    max?: number;
  }>;
  images?: Array<{
    url?: string;
    width?: number;
    height?: number;
    ratio?: string;
    fallback?: boolean;
  }>;
  seatmap?: {
    staticUrl?: string;
  };
  ticketLimit?: {
    info?: string;
  };
  ageRestrictions?: {
    legalAgeEnforced?: boolean;
  };
  _embedded?: {
    venues?: TMVenue[];
    attractions?: TMAttraction[];
  };
}

export interface TMVenue {
  id: string;
  name: string;
  type: string;
  url?: string;
  locale?: string;
  postalCode?: string;
  timezone?: string;
  city?: {
    name?: string;
  };
  state?: {
    name?: string;
    stateCode?: string;
  };
  country?: {
    name?: string;
    countryCode?: string;
  };
  address?: {
    line1?: string;
    line2?: string;
  };
  location?: {
    latitude?: string;
    longitude?: string;
  };
  images?: Array<{
    url?: string;
    width?: number;
    height?: number;
    ratio?: string;
  }>;
  parkingDetail?: string;
  boxOfficeInfo?: {
    phoneNumberDetail?: string;
    openHoursDetail?: string;
  };
  generalInfo?: {
    generalRule?: string;
    childRule?: string;
  };
  upcomingEvents?: {
    _total?: number;
  };
}

export interface TMAttraction {
  id: string;
  name: string;
  type: string;
  url?: string;
  images?: Array<{
    url?: string;
    width?: number;
    height?: number;
    ratio?: string;
  }>;
}

export interface TMSearchResponse {
  _embedded?: {
    events?: TMEvent[];
    venues?: TMVenue[];
    attractions?: TMAttraction[];
  };
  page?: {
    size?: number;
    totalElements?: number;
    totalPages?: number;
    number?: number;
  };
  _links?: {
    self?: { href?: string };
    next?: { href?: string };
    prev?: { href?: string };
  };
}
