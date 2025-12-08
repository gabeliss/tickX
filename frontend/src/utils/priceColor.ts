/**
 * Price Color Utilities
 *
 * Functions for calculating price-based colors for venue map sections.
 */

import type { Listing } from '../types';
import type { SectionPriceInfo } from '../types/venueMap';

/**
 * Calculate a color based on price relative to the min/max range.
 * Uses HSL color space for smooth gradient from green (cheap) to red (expensive).
 *
 * @param price - The price to get color for
 * @param minPrice - Minimum price in range
 * @param maxPrice - Maximum price in range
 * @returns HSL color string
 */
export function getPriceColor(
  price: number,
  minPrice: number,
  maxPrice: number
): string {
  // Handle edge case where all prices are the same
  const range = maxPrice - minPrice;
  if (range === 0) {
    return 'hsl(120, 65%, 45%)'; // Green for single price
  }

  // Normalize price to 0-1 range
  const normalized = (price - minPrice) / range;

  // Map to hue: 120 (green) -> 60 (yellow) -> 0 (red)
  // Using a slightly curved mapping for better visual distribution
  const hue = 120 - normalized * 120;

  // Adjust saturation and lightness for better visibility
  const saturation = 65 + normalized * 10; // 65-75%
  const lightness = 45 + (1 - normalized) * 10; // 45-55%

  return `hsl(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(lightness)}%)`;
}

/**
 * Calculate price information for each section based on listings.
 *
 * @param listings - Array of listings to analyze
 * @returns Map of section ID to price info
 */
export function calculateSectionPrices(
  listings: Listing[]
): Map<string, SectionPriceInfo> {
  const sectionMap = new Map<string, SectionPriceInfo>();

  // Group listings by section
  const grouped: Record<string, Listing[]> = {};
  for (const listing of listings) {
    const section = listing.section;
    if (!grouped[section]) {
      grouped[section] = [];
    }
    grouped[section].push(listing);
  }

  // Calculate stats per section
  for (const [sectionId, sectionListings] of Object.entries(grouped)) {
    const prices = sectionListings.map((l) => l.currentPrice);
    sectionMap.set(sectionId, {
      sectionId,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      listingCount: sectionListings.length,
    });
  }

  return sectionMap;
}

/**
 * Get the overall price range from all listings.
 *
 * @param listings - Array of listings
 * @returns Object with min and max prices
 */
export function getPriceRange(listings: Listing[]): { min: number; max: number } {
  if (listings.length === 0) {
    return { min: 0, max: 0 };
  }

  const prices = listings.map((l) => l.currentPrice);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

/**
 * Format price for display
 *
 * @param price - Price in dollars
 * @returns Formatted price string
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
