/**
 * TickX API Service
 *
 * Handles all communication with the backend API
 */

import type { Event, Venue, EventCategory } from '../types';

// API URL - will be set after backend deployment
// For local development, can override with VITE_API_URL environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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
  const events = await fetchApi<ApiEvent[]>('/events', {
    city: params.city,
    category: params.category,
    venueId: params.venueId,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    pageSize: params.pageSize?.toString(),
    cursor: params.cursor,
    keyword: params.keyword,
  });
  
  // Transform direct array response to paginated format
  return {
    data: events,
    pagination: {
      page: 1,
      pageSize: params.pageSize || 20,
      totalItems: events.length,
      totalPages: 1,
      hasMore: false,
    },
  };
}

/**
 * Search events by keyword
 */
export async function searchEvents(
  keyword: string,
  params: { city?: string; category?: EventCategory; pageSize?: number } = {}
): Promise<PaginatedResponse<ApiEvent>> {
  const events = await fetchApi<ApiEvent[]>('/events', {
    keyword,
    city: params.city,
    category: params.category,
    pageSize: params.pageSize?.toString(),
  });
  
  // Transform direct array response to paginated format
  return {
    data: events,
    pagination: {
      page: 1,
      pageSize: params.pageSize || 20,
      totalItems: events.length,
      totalPages: 1,
      hasMore: false,
    },
  };
}

/**
 * Get a single event by ID
 */
export async function getEvent(eventId: string): Promise<{ data: ApiEvent }> {
  const event = await fetchApi<ApiEvent>(`/events/${eventId}`);
  return { data: event };
}

/**
 * Get venues with optional filters
 */
export async function getVenues(params: VenueSearchParams = {}): Promise<PaginatedResponse<ApiVenue>> {
  const venues = await fetchApi<ApiVenue[]>('/venues', {
    city: params.city,
    pageSize: params.pageSize?.toString(),
    cursor: params.cursor,
  });
  
  // Transform direct array response to paginated format
  return {
    data: venues,
    pagination: {
      page: 1,
      pageSize: params.pageSize || 50,
      totalItems: venues.length,
      totalPages: 1,
      hasMore: false,
    },
  };
}

/**
 * Get a single venue by ID
 */
export async function getVenue(venueId: string): Promise<{ data: ApiVenue }> {
  const venue = await fetchApi<ApiVenue>(`/venues/${venueId}`);
  return { data: venue };
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
