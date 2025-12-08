/**
 * SectionTooltip Component
 *
 * Displays information about a venue section on hover.
 * Shows section name, price range, and listing count.
 */

import type { VenueSection, SectionPriceInfo } from '../../types/venueMap';
import { formatPrice } from '../../utils/priceColor';
import styles from './SectionTooltip.module.css';

interface SectionTooltipProps {
  section: VenueSection;
  priceInfo: SectionPriceInfo | undefined;
  position: { x: number; y: number };
}

export function SectionTooltip({
  section,
  priceInfo,
  position,
}: SectionTooltipProps) {
  const hasListings = priceInfo && priceInfo.listingCount > 0;

  // Offset tooltip from cursor
  const tooltipStyle = {
    left: `${position.x + 15}px`,
    top: `${position.y - 10}px`,
  };

  return (
    <div className={styles.tooltip} style={tooltipStyle}>
      <div className={styles.sectionName}>{section.name}</div>

      {hasListings ? (
        <>
          <div className={styles.priceRow}>
            <span className={styles.label}>From</span>
            <span className={styles.price}>{formatPrice(priceInfo.minPrice)}</span>
          </div>
          <div className={styles.listingCount}>
            {priceInfo.listingCount} {priceInfo.listingCount === 1 ? 'listing' : 'listings'}
          </div>
        </>
      ) : (
        <div className={styles.noListings}>No listings available</div>
      )}

      {hasListings && (
        <div className={styles.hint}>Click to filter</div>
      )}
    </div>
  );
}

export default SectionTooltip;
