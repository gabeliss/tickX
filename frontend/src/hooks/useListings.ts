import { useState, useEffect, useCallback } from 'react';
import { 
  createListing, 
  getListing, 
  getSellerListings,
  getEventListings,
  transformApiListing,
  type CreateListingRequest
} from '../services/listingApi';
import type { Listing } from '../types';

export function useCreateListing() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (listingData: CreateListingRequest): Promise<Listing | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await createListing(listingData);
      return transformApiListing(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { create, isLoading, error };
}

export function useListing(listingId: string | undefined) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!listingId) return;

    const fetchListing = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await getListing(listingId);
        setListing(transformApiListing(response.data));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch listing');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  return { listing, isLoading, error };
}

export function useSellerListings(sellerId: string | undefined) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    if (!sellerId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getSellerListings(sellerId);
      setListings(response.data.map(transformApiListing));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch listings');
    } finally {
      setIsLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const deleteListing = async (listingId: string): Promise<boolean> => {
    try {
      // TODO: Implement deleteListing API call when available
      // await deleteListing(listingId);
      setListings(prev => prev.filter(l => l.id !== listingId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete listing');
      return false;
    }
  };

  return { 
    listings, 
    isLoading, 
    error, 
    refetch: fetchListings,
    deleteListing 
  };
}

export function useEventListings(eventId: string | undefined) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;

    const fetchListings = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await getEventListings(eventId);
        setListings(response.data.map(transformApiListing));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch event listings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [eventId]);

  return { listings, isLoading, error };
}