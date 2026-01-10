/**
 * Listing API Service
 */

import type { Listing } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface CreateListingRequest {
  sellerId: string;
  eventId: string;
  listingType: 'auction' | 'fixed' | 'hybrid' | 'declining';
  section: string;
  row: string;
  seats: string[];
  quantity: number;
  startingPrice: number;
  currentPrice: number;
  buyNowPrice?: number;
  reservePrice?: number;
  floorPrice?: number;
  auctionEndTime?: string;
  allowSplitting: boolean;
  minQuantity: number;
  bidIncrement: number;
}

export interface ApiListing {
  listingId: string;
  sellerId: string;
  eventId: string;
  listingType: string;
  status: string;
  section: string;
  row: string;
  seats: string[];
  quantity: number;
  startingPrice: number;
  currentPrice: number;
  buyNowPrice?: number;
  reservePrice?: number;
  floorPrice?: number;
  bidCount?: number;
  auctionEndTime?: string;
  reserveMet?: boolean;
  allowSplitting: boolean;
  minQuantity: number;
  bidIncrement: number;
  watcherCount?: number;
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Create a new listing
 */
export async function createListing(listing: CreateListingRequest): Promise<{ data: ApiListing }> {
  const result = await fetchApi<ApiListing>('/listings', {
    method: 'POST',
    body: JSON.stringify(listing),
  });
  return { data: result };
}

/**
 * Get a single listing by ID
 */
export async function getListing(listingId: string): Promise<{ data: ApiListing }> {
  const result = await fetchApi<ApiListing>(`/listings/${listingId}`);
  return { data: result };
}

/**
 * Update an existing listing
 */
export async function updateListing(listingId: string, listing: Partial<CreateListingRequest>): Promise<{ data: ApiListing }> {
  return fetchApi<{ data: ApiListing }>(`/listings/${listingId}`, {
    method: 'PUT',
    body: JSON.stringify(listing),
  });
}

/**
 * Delete a listing
 */
export async function deleteListing(listingId: string): Promise<void> {
  await fetchApi<void>(`/listings/${listingId}`, {
    method: 'DELETE',
  });
}

/**
 * Get listings by seller (for dashboard)
 */
export async function getSellerListings(sellerId: string): Promise<{ data: ApiListing[] }> {
  const listings = await fetchApi<ApiListing[]>(`/listings?sellerId=${sellerId}`);
  return { data: listings };
}

/**
 * Get listings for an event
 */
export async function getEventListings(eventId: string): Promise<{ data: ApiListing[] }> {
  const listings = await fetchApi<ApiListing[]>(`/listings?eventId=${eventId}`);
  return { data: listings };
}

/**
 * Get active listings
 */
export async function getActiveListings(): Promise<{ data: ApiListing[] }> {
  const listings = await fetchApi<ApiListing[]>('/listings?status=active');
  return { data: listings };
}

/**
 * Transform API listing to frontend Listing type
 */
export function transformApiListing(apiListing: ApiListing): Listing {
  // This would need to be implemented with proper event/user data
  // For now, return a partial transformation
  return {
    id: apiListing.listingId,
    sellerId: apiListing.sellerId,
    seller: {
      id: apiListing.sellerId,
      email: '',
      name: 'Seller',
      verificationLevel: 'email_verified',
      rating: 4.5,
      createdAt: '',
    },
    eventId: apiListing.eventId,
    event: {
      id: apiListing.eventId,
      name: 'Event',
      category: 'concert',
      venue: {
        id: '',
        name: 'Venue',
        address: '',
        city: '',
        state: '',
        zip: '',
        capacity: 0,
      },
      eventDate: new Date().toISOString(), // Use current date as fallback
      imageUrl: '',
      status: 'scheduled',
    },
    listingType: apiListing.listingType as any,
    status: apiListing.status as any,
    section: apiListing.section,
    row: apiListing.row,
    seats: apiListing.seats,
    quantity: apiListing.quantity,
    startingPrice: apiListing.startingPrice,
    currentPrice: apiListing.currentPrice,
    buyNowPrice: apiListing.buyNowPrice,
    reservePrice: apiListing.reservePrice,
    floorPrice: apiListing.floorPrice,
    bidCount: apiListing.bidCount,
    auctionEndTime: apiListing.auctionEndTime,
    reserveMet: apiListing.reserveMet,
    allowSplitting: apiListing.allowSplitting,
    minQuantity: apiListing.minQuantity,
    bidIncrement: apiListing.bidIncrement,
    watcherCount: apiListing.watcherCount,
    viewCount: apiListing.viewCount,
    createdAt: apiListing.createdAt,
    updatedAt: apiListing.updatedAt,
  };
}