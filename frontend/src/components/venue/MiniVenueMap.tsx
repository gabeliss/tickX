/**
 * MiniVenueMap Component
 *
 * A smaller, non-interactive venue map for the ListingDetail page.
 * Shows the venue with the selected section highlighted.
 */

import type { VenueMapConfig } from '../../types/venueMap';
import styles from './MiniVenueMap.module.css';

interface MiniVenueMapProps {
  mapConfig: VenueMapConfig;
  highlightedSection: string;
  className?: string;
}

export function MiniVenueMap({
  mapConfig,
  highlightedSection,
  className,
}: MiniVenueMapProps) {
  return (
    <div className={`${styles.container} ${className || ''}`}>
      <svg
        viewBox={mapConfig.viewBox}
        className={styles.svg}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="var(--color-neutral-100)"
        />

        {/* Court/Stage area */}
        {mapConfig.courtArea && (
          <g>
            <path
              d={mapConfig.courtArea.path}
              fill="var(--color-neutral-50)"
              stroke="var(--color-neutral-300)"
              strokeWidth="2"
            />
            <text
              x="405"
              y="315"
              className={styles.courtLabel}
            >
              {mapConfig.courtArea.label}
            </text>
          </g>
        )}

        {/* Sections */}
        {mapConfig.sections.map((section) => {
          const isHighlighted = section.id === highlightedSection;
          return (
            <path
              key={section.id}
              d={section.path}
              className={isHighlighted ? styles.highlightedSection : styles.section}
              fill={isHighlighted ? 'var(--color-primary)' : 'var(--color-neutral-200)'}
            />
          );
        })}

        {/* Highlighted section label */}
        {mapConfig.sections
          .filter((s) => s.id === highlightedSection)
          .map((section) => (
            <g key={`label-${section.id}`}>
              {/* Pulse animation behind the section */}
              <circle
                cx={section.labelPosition.x}
                cy={section.labelPosition.y}
                r="25"
                className={styles.pulse}
              />
              {/* Section label */}
              <text
                x={section.labelPosition.x}
                y={section.labelPosition.y}
                className={styles.sectionLabel}
              >
                {section.id}
              </text>
            </g>
          ))}
      </svg>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} />
          <span>Your section</span>
        </div>
      </div>
    </div>
  );
}

export default MiniVenueMap;
