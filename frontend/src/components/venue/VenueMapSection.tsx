/**
 * VenueMapSection Component
 *
 * Renders an individual section of the venue map as an SVG path.
 * Handles hover/click interactions and displays price-based coloring.
 */

import { memo } from 'react';
import type { VenueSection, SectionPriceInfo } from '../../types/venueMap';
import { getPriceColor, formatPrice } from '../../utils/priceColor';
import styles from './VenueMapSection.module.css';

interface VenueMapSectionProps {
  section: VenueSection;
  priceInfo: SectionPriceInfo | undefined;
  priceRange: { min: number; max: number };
  isHovered: boolean;
  isSelected: boolean;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

export const VenueMapSection = memo(function VenueMapSection({
  section,
  priceInfo,
  priceRange,
  isHovered,
  isSelected,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: VenueMapSectionProps) {
  const hasListings = priceInfo && priceInfo.listingCount > 0;

  // Calculate fill color based on price
  const fillColor = hasListings
    ? getPriceColor(priceInfo.minPrice, priceRange.min, priceRange.max)
    : 'var(--color-neutral-200)';

  // Build class names
  const pathClassName = [
    styles.section,
    hasListings ? styles.hasListings : styles.noListings,
    isHovered ? styles.hovered : '',
    isSelected ? styles.selected : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <g className={styles.sectionGroup}>
      {/* Section path */}
      <path
        d={section.path}
        className={pathClassName}
        style={{ fill: fillColor }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      />

      {/* Price label */}
      {hasListings && (
        <text
          x={section.labelPosition.x}
          y={section.labelPosition.y}
          className={styles.priceLabel}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={onClick}
        >
          {formatPrice(priceInfo.minPrice)}
        </text>
      )}
    </g>
  );
});

export default VenueMapSection;
