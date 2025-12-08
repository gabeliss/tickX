/**
 * VenueMap Component
 *
 * Main interactive venue map displaying sections with price coloring.
 * Integrates with VenueMapContext for hover/selection state.
 */

import { useCallback, useState, useRef, useMemo } from 'react';
import type { VenueMapConfig, VenueSection } from '../../types/venueMap';
import { useVenueMap } from '../../context/VenueMapContext';
import { VenueMapSection } from './VenueMapSection';
import { SectionTooltip } from './SectionTooltip';
import styles from './VenueMap.module.css';

interface VenueMapProps {
  mapConfig: VenueMapConfig;
  className?: string;
}

export function VenueMap({ mapConfig, className }: VenueMapProps) {
  const {
    hoveredSection,
    selectedSection,
    hoveredListingId,
    sectionPriceData,
    priceRange,
    setHoveredSection,
    setSelectedSection,
  } = useVenueMap();

  // Tooltip state
  const [tooltipSection, setTooltipSection] = useState<VenueSection | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Find section that's hovered from listing
  const sectionFromListing = useMemo(() => {
    if (!hoveredListingId) return null;
    // The listing's section ID should match a map section
    return hoveredSection;
  }, [hoveredListingId, hoveredSection]);

  // Handle section hover
  const handleSectionMouseEnter = useCallback(
    (section: VenueSection, event: React.MouseEvent) => {
      setHoveredSection(section.id);
      setTooltipSection(section);

      // Position tooltip near cursor
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setTooltipPosition({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
    },
    [setHoveredSection]
  );

  const handleSectionMouseLeave = useCallback(() => {
    setHoveredSection(null);
    setTooltipSection(null);
  }, [setHoveredSection]);

  const handleSectionClick = useCallback(
    (sectionId: string) => {
      setSelectedSection(sectionId);
    },
    [setSelectedSection]
  );

  // Determine if a section should be highlighted
  const isSectionHighlighted = useCallback(
    (sectionId: string) => {
      return (
        hoveredSection === sectionId ||
        selectedSection === sectionId ||
        (sectionFromListing === sectionId && hoveredListingId !== null)
      );
    },
    [hoveredSection, selectedSection, sectionFromListing, hoveredListingId]
  );

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className || ''}`}
    >
      {/* Map header */}
      <div className={styles.header}>
        <span className={styles.venueName}>{mapConfig.venueName}</span>
        {selectedSection && (
          <button
            className={styles.clearFilter}
            onClick={() => setSelectedSection(null)}
          >
            Clear filter
          </button>
        )}
      </div>

      {/* SVG Map */}
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
          <g className={styles.courtArea}>
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
        {mapConfig.sections.map((section) => (
          <VenueMapSection
            key={section.id}
            section={section}
            priceInfo={sectionPriceData.get(section.id)}
            priceRange={priceRange}
            isHovered={isSectionHighlighted(section.id)}
            isSelected={selectedSection === section.id}
            onMouseEnter={(e: React.MouseEvent) =>
              handleSectionMouseEnter(section, e)
            }
            onMouseLeave={handleSectionMouseLeave}
            onClick={() => handleSectionClick(section.id)}
          />
        ))}
      </svg>

      {/* Tooltip */}
      {tooltipSection && (
        <SectionTooltip
          section={tooltipSection}
          priceInfo={sectionPriceData.get(tooltipSection.id)}
          position={tooltipPosition}
        />
      )}

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span
            className={styles.legendColor}
            style={{ background: 'hsl(120, 65%, 45%)' }}
          />
          <span>Lower price</span>
        </div>
        <div className={styles.legendItem}>
          <span
            className={styles.legendColor}
            style={{ background: 'hsl(60, 70%, 50%)' }}
          />
          <span>Mid price</span>
        </div>
        <div className={styles.legendItem}>
          <span
            className={styles.legendColor}
            style={{ background: 'hsl(0, 75%, 50%)' }}
          />
          <span>Higher price</span>
        </div>
        <div className={styles.legendItem}>
          <span
            className={styles.legendColor}
            style={{ background: 'var(--color-neutral-200)' }}
          />
          <span>No listings</span>
        </div>
      </div>
    </div>
  );
}

export default VenueMap;
