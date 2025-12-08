/**
 * SeatViewPreview Component
 *
 * Shows a preview image of the view from seats when hovering a listing.
 * Displays the section/row info and a sample view image.
 */

import { Eye } from 'lucide-react';
import type { VenueSection } from '../../types/venueMap';
import styles from './SeatViewPreview.module.css';

interface SeatViewPreviewProps {
  section: VenueSection;
  row?: string;
  isVisible: boolean;
}

// Mock view images - using placeholder gradients
// In production, these would be actual venue photography
const VIEW_PLACEHOLDERS: Record<string, string> = {
  floor: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  lower: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
  upper: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
  suite: 'linear-gradient(180deg, #1a1a2e 0%, #2d2d44 50%, #16213e 100%)',
};

export function SeatViewPreview({
  section,
  row,
  isVisible,
}: SeatViewPreviewProps) {
  if (!isVisible) return null;

  const gradientBackground = VIEW_PLACEHOLDERS[section.tier || 'lower'];

  return (
    <div className={styles.preview}>
      {/* View image placeholder */}
      <div
        className={styles.imageContainer}
        style={{ background: gradientBackground }}
      >
        {/* Court representation */}
        <div className={styles.courtView}>
          <div className={styles.courtOutline}>
            <div className={styles.courtCenter} />
          </div>
        </div>

        {/* View quality badge */}
        <div className={styles.viewBadge}>
          <Eye size={12} />
          <span>View from seat</span>
        </div>

        {/* Tier indicator */}
        <div className={styles.tierBadge}>
          {section.tier === 'floor' && 'Floor Level'}
          {section.tier === 'lower' && 'Lower Bowl'}
          {section.tier === 'upper' && 'Upper Bowl'}
          {section.tier === 'suite' && 'Suite Level'}
          {!section.tier && 'Standard'}
        </div>
      </div>

      {/* Section info */}
      <div className={styles.info}>
        <span className={styles.sectionLabel}>{section.name}</span>
        {row && <span className={styles.rowLabel}>Row {row}</span>}
      </div>
    </div>
  );
}

export default SeatViewPreview;
