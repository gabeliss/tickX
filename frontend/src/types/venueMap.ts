/**
 * Venue Map Types
 *
 * Type definitions for interactive venue maps with section visualization.
 */

/**
 * Represents a single section in the venue map
 */
export interface VenueSection {
  /** Unique section identifier (e.g., "101", "305", "Floor") */
  id: string;
  /** Display name for the section */
  name: string;
  /** SVG path data for the section shape */
  path: string;
  /** Position for the price label */
  labelPosition: { x: number; y: number };
  /** Section tier for styling purposes */
  tier?: 'floor' | 'lower' | 'upper' | 'suite';
}

/**
 * Configuration for a venue's interactive map
 */
export interface VenueMapConfig {
  /** Venue ID this map belongs to */
  venueId: string;
  /** Venue name for display */
  venueName: string;
  /** SVG viewBox attribute (e.g., "0 0 800 500") */
  viewBox: string;
  /** All sections in the venue */
  sections: VenueSection[];
  /** Court/stage/field area definition */
  courtArea?: {
    path: string;
    label: string;
  };
}

/**
 * Price information for a section based on available listings
 */
export interface SectionPriceInfo {
  /** Section ID */
  sectionId: string;
  /** Lowest price in this section */
  minPrice: number;
  /** Highest price in this section */
  maxPrice: number;
  /** Number of listings in this section */
  listingCount: number;
}

/**
 * State managed by VenueMapContext
 */
export interface VenueMapState {
  /** Section currently being hovered (from either listings or map) */
  hoveredSection: string | null;
  /** Section selected for filtering */
  selectedSection: string | null;
  /** Listing ID currently being hovered */
  hoveredListingId: string | null;
  /** Price data by section */
  sectionPriceData: Map<string, SectionPriceInfo>;
  /** Overall price range for color scaling */
  priceRange: { min: number; max: number };
}

/**
 * Actions available from VenueMapContext
 */
export interface VenueMapActions {
  setHoveredSection: (section: string | null) => void;
  setSelectedSection: (section: string | null) => void;
  setHoveredListingId: (id: string | null) => void;
}

/**
 * Combined context type
 */
export type VenueMapContextType = VenueMapState & VenueMapActions;
