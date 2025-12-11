/**
 * TickX API Service
 *
 * Handles all communication with the backend API
 */

import type { Event, Venue, EventCategory } from '../types';

const API_BASE_URL = 'https://astjniigq5.execute-api.us-east-1.amazonaws.com/v1';

// =============================================================================
// Types
// =============================================================================

export interface ApiEvent {
  id: string;
  name: string;
  description?: string;
  category: EventCategory;
  status: 'scheduled' | 'postponed' | 'cancelled';
  eventDate: string;
  localDate: string;
  localTime?: string;
  timezone: string;
  venueId: string;
  venueName: string;
  venueCity: string;
  venueState: string;
  venueStateCode: string;
  imageUrl: string;
  thumbnailUrl?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  attractions?: Array<{
    id: string;
    name: string;
    imageUrl?: string;
  }>;
  segment?: string;
  genre?: string;
  subGenre?: string;
  url?: string;
  seatmapUrl?: string;
  isFeatured?: boolean;
  listingCount?: number;
}

export interface ApiVenue {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  postalCode: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
}

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
  dateFrom?: string;
  dateTo?: string;
  pageSize?: number;
  cursor?: string;
  keyword?: string;
}

export interface VenueSearchParams {
  city?: string;
  pageSize?: number;
  cursor?: string;
}

// =============================================================================
// API Functions
// =============================================================================

async function fetchApi<T>(endpoint: string, params: Record<string, string | undefined> = {}): Promise<T> {
  const url = new URL(`${API_BASE_URL}${endpoint}`);

  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url.toString());

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get events with optional filters
 */
export async function getEvents(params: EventSearchParams = {}): Promise<PaginatedResponse<ApiEvent>> {
  return fetchApi<PaginatedResponse<ApiEvent>>('/events', {
    city: params.city,
    category: params.category,
    venueId: params.venueId,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    pageSize: params.pageSize?.toString(),
    cursor: params.cursor,
    keyword: params.keyword,
  });
}

/**
 * Search events by keyword
 */
export async function searchEvents(
  keyword: string,
  params: { city?: string; category?: EventCategory; pageSize?: number } = {}
): Promise<PaginatedResponse<ApiEvent>> {
  return fetchApi<PaginatedResponse<ApiEvent>>('/events', {
    keyword,
    city: params.city,
    category: params.category,
    pageSize: params.pageSize?.toString(),
  });
}

/**
 * Get a single event by ID
 */
export async function getEvent(eventId: string): Promise<{ data: ApiEvent }> {
  return fetchApi<{ data: ApiEvent }>(`/events/${eventId}`);
}

/**
 * Get venues with optional filters
 */
export async function getVenues(params: VenueSearchParams = {}): Promise<PaginatedResponse<ApiVenue>> {
  return fetchApi<PaginatedResponse<ApiVenue>>('/venues', {
    city: params.city,
    pageSize: params.pageSize?.toString(),
    cursor: params.cursor,
  });
}

/**
 * Get a single venue by ID
 */
export async function getVenue(venueId: string): Promise<{ data: ApiVenue }> {
  return fetchApi<{ data: ApiVenue }>(`/venues/${venueId}`);
}

// =============================================================================
// Transform Functions (API -> Frontend types)
// =============================================================================

/**
 * Transform API event to frontend Event type
 */
export function transformApiEvent(apiEvent: ApiEvent): Event {
  return {
    id: apiEvent.id,
    name: apiEvent.name,
    description: apiEvent.description,
    category: apiEvent.category,
    status: apiEvent.status,
    eventDate: apiEvent.eventDate,
    doorsTime: apiEvent.localTime,
    imageUrl: apiEvent.imageUrl || '',
    thumbnailUrl: apiEvent.thumbnailUrl,
    minPrice: apiEvent.minPrice,
    maxPrice: apiEvent.maxPrice,
    listingCount: apiEvent.listingCount || 0,
    isFeatured: apiEvent.isFeatured || false,
    artists: apiEvent.attractions?.map(a => a.name) || [],
    tags: [apiEvent.genre, apiEvent.subGenre].filter(Boolean) as string[],
    venue: {
      id: apiEvent.venueId,
      name: apiEvent.venueName,
      city: apiEvent.venueCity,
      state: apiEvent.venueState,
      address: '',
      zip: '',
      capacity: 0,
    },
  };
}

/**
 * Transform API venue to frontend Venue type
 */
export function transformApiVenue(apiVenue: ApiVenue): Venue {
  return {
    id: apiVenue.id,
    name: apiVenue.name,
    address: apiVenue.address,
    city: apiVenue.city,
    state: apiVenue.state,
    zip: apiVenue.postalCode,
    capacity: 0,
    imageUrl: apiVenue.imageUrl,
  };
}
