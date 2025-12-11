/**
 * React hooks for fetching events and venues from the API
 */

import { useState, useEffect, useCallback } from 'react';
import type { Event, Venue, EventCategory } from '../types';
import {
  getEvents,
  getEvent,
  getVenues,
  getVenue,
  searchEvents,
  transformApiEvent,
  transformApiVenue,
  type EventSearchParams,
} from '../services/api';

// =============================================================================
// useEvents Hook
// =============================================================================

interface UseEventsOptions {
  city?: string;
  category?: EventCategory;
  venueId?: string;
  dateFrom?: string;
  dateTo?: string;
  pageSize?: number;
  autoFetch?: boolean;
}

interface UseEventsResult {
  events: Event[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export function useEvents(options: UseEventsOptions = {}): UseEventsResult {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>();

  const { city = 'chicago', category, venueId, dateFrom, dateTo, pageSize = 20, autoFetch = true } = options;

  const fetchEvents = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const params: EventSearchParams = {
        city,
        category,
        venueId,
        dateFrom,
        dateTo,
        pageSize,
        cursor: reset ? undefined : cursor,
      };

      const response = await getEvents(params);
      const transformedEvents = response.data.map(transformApiEvent);

      if (reset) {
        setEvents(transformedEvents);
      } else {
        setEvents(prev => [...prev, ...transformedEvents]);
      }

      setHasMore(response.pagination.hasMore);
      // Note: cursor handling would need to be implemented in the API
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [city, category, venueId, dateFrom, dateTo, pageSize, cursor]);

  const refresh = useCallback(async () => {
    setCursor(undefined);
    await fetchEvents(true);
  }, [fetchEvents]);

  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      await fetchEvents(false);
    }
  }, [loading, hasMore, fetchEvents]);

  useEffect(() => {
    if (autoFetch) {
      fetchEvents(true);
    }
  }, [city, category, venueId, dateFrom, dateTo, pageSize]);

  return { events, loading, error, hasMore, refresh, loadMore };
}

// =============================================================================
// useEvent Hook (single event)
// =============================================================================

interface UseEventResult {
  event: Event | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useEvent(eventId: string | undefined): UseEventResult {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!eventId) {
      setEvent(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await getEvent(eventId);
      setEvent(transformApiEvent(response.data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load event');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return { event, loading, error, refresh: fetchEvent };
}

// =============================================================================
// useVenues Hook
// =============================================================================

interface UseVenuesOptions {
  city?: string;
  pageSize?: number;
  autoFetch?: boolean;
}

interface UseVenuesResult {
  venues: Venue[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useVenues(options: UseVenuesOptions = {}): UseVenuesResult {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { city = 'chicago', pageSize = 50, autoFetch = true } = options;

  const fetchVenues = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getVenues({ city, pageSize });
      const transformedVenues = response.data.map(transformApiVenue);
      setVenues(transformedVenues);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load venues');
    } finally {
      setLoading(false);
    }
  }, [city, pageSize]);

  useEffect(() => {
    if (autoFetch) {
      fetchVenues();
    }
  }, [city, pageSize]);

  return { venues, loading, error, refresh: fetchVenues };
}

// =============================================================================
// useVenue Hook (single venue)
// =============================================================================

interface UseVenueResult {
  venue: Venue | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useVenue(venueId: string | undefined): UseVenueResult {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVenue = useCallback(async () => {
    if (!venueId) {
      setVenue(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await getVenue(venueId);
      setVenue(transformApiVenue(response.data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load venue');
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    fetchVenue();
  }, [fetchVenue]);

  return { venue, loading, error, refresh: fetchVenue };
}

// =============================================================================
// useSearch Hook (keyword search)
// =============================================================================

interface UseSearchOptions {
  city?: string;
  category?: EventCategory;
  pageSize?: number;
}

interface UseSearchResult {
  events: Event[];
  loading: boolean;
  error: string | null;
  totalResults: number;
  search: (keyword: string) => Promise<void>;
  clear: () => void;
}

export function useSearch(options: UseSearchOptions = {}): UseSearchResult {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);

  const { city, category, pageSize = 20 } = options;

  const search = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setEvents([]);
      setTotalResults(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await searchEvents(keyword, { city, category, pageSize });
      const transformedEvents = response.data.map(transformApiEvent);

      setEvents(transformedEvents);
      setTotalResults(response.pagination.totalItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setEvents([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, [city, category, pageSize]);

  const clear = useCallback(() => {
    setEvents([]);
    setTotalResults(0);
    setError(null);
  }, []);

  return { events, loading, error, totalResults, search, clear };
}
