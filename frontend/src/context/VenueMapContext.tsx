/**
 * VenueMapContext
 *
 * Provides shared state for venue map interactions between
 * the listings panel and the interactive map.
 */

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import type { Listing } from '../types';
import type { VenueMapContextType } from '../types/venueMap';
import { calculateSectionPrices, getPriceRange } from '../utils/priceColor';

// Create context with undefined default (will be provided by provider)
const VenueMapContext = createContext<VenueMapContextType | undefined>(undefined);

interface VenueMapProviderProps {
  children: ReactNode;
  listings: Listing[];
}

/**
 * Provider component for venue map state.
 * Wrap this around the split layout containing both listings and map.
 */
export function VenueMapProvider({ children, listings }: VenueMapProviderProps) {
  // Hover state
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [hoveredListingId, setHoveredListingId] = useState<string | null>(null);

  // Calculate section price data from listings
  const sectionPriceData = useMemo(() => {
    return calculateSectionPrices(listings);
  }, [listings]);

  // Calculate overall price range
  const priceRange = useMemo(() => {
    return getPriceRange(listings);
  }, [listings]);

  // Memoized setters to prevent unnecessary re-renders
  const handleSetHoveredSection = useCallback((section: string | null) => {
    setHoveredSection(section);
  }, []);

  const handleSetSelectedSection = useCallback((section: string | null) => {
    setSelectedSection((current) => (current === section ? null : section));
  }, []);

  const handleSetHoveredListingId = useCallback((id: string | null) => {
    setHoveredListingId(id);
  }, []);

  // Combine state and actions
  const value = useMemo<VenueMapContextType>(
    () => ({
      hoveredSection,
      selectedSection,
      hoveredListingId,
      sectionPriceData,
      priceRange,
      setHoveredSection: handleSetHoveredSection,
      setSelectedSection: handleSetSelectedSection,
      setHoveredListingId: handleSetHoveredListingId,
    }),
    [
      hoveredSection,
      selectedSection,
      hoveredListingId,
      sectionPriceData,
      priceRange,
      handleSetHoveredSection,
      handleSetSelectedSection,
      handleSetHoveredListingId,
    ]
  );

  return (
    <VenueMapContext.Provider value={value}>
      {children}
    </VenueMapContext.Provider>
  );
}

/**
 * Hook to access venue map context.
 * Must be used within a VenueMapProvider.
 */
export function useVenueMap(): VenueMapContextType {
  const context = useContext(VenueMapContext);
  if (context === undefined) {
    throw new Error('useVenueMap must be used within a VenueMapProvider');
  }
  return context;
}

/**
 * Hook to check if we're inside a VenueMapProvider.
 * Useful for components that can work with or without the context.
 */
export function useVenueMapOptional(): VenueMapContextType | null {
  const context = useContext(VenueMapContext);
  return context ?? null;
}

export default VenueMapContext;
