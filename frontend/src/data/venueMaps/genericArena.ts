/**
 * Generic Arena Venue Map Template
 *
 * A realistic-looking arena template that can be customized for different venues.
 * Uses curved sections arranged in an oval pattern around a central court/stage.
 */

import type { VenueMapConfig, VenueSection } from '../../types/venueMap';

/**
 * Generate an arc path for arena sections
 */
function createArcSection(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
): string {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const innerStartX = cx + innerRadius * Math.cos(toRad(startAngle));
  const innerStartY = cy + innerRadius * Math.sin(toRad(startAngle));
  const innerEndX = cx + innerRadius * Math.cos(toRad(endAngle));
  const innerEndY = cy + innerRadius * Math.sin(toRad(endAngle));

  const outerStartX = cx + outerRadius * Math.cos(toRad(startAngle));
  const outerStartY = cy + outerRadius * Math.sin(toRad(startAngle));
  const outerEndX = cx + outerRadius * Math.cos(toRad(endAngle));
  const outerEndY = cy + outerRadius * Math.sin(toRad(endAngle));

  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;

  return `M ${outerStartX} ${outerStartY}
          A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEndX} ${outerEndY}
          L ${innerEndX} ${innerEndY}
          A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStartX} ${innerStartY}
          Z`;
}

/**
 * Get label position for an arc section
 */
function getArcLabelPosition(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
): { x: number; y: number } {
  const midAngle = (startAngle + endAngle) / 2;
  const midRadius = (innerRadius + outerRadius) / 2;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  return {
    x: cx + midRadius * Math.cos(toRad(midAngle)),
    y: cy + midRadius * Math.sin(toRad(midAngle)),
  };
}

// Arena center point
const CX = 400;
const CY = 300;

// Ring radii (from center outward)
const COURT_WIDTH = 100;
const COURT_HEIGHT = 60;

const FLOOR_INNER = 85;
const FLOOR_OUTER = 115;

const LOWER_INNER = 125;
const LOWER_OUTER = 175;

const UPPER_INNER = 185;
const UPPER_OUTER = 250;

// Generate lower bowl sections (100 level) - 16 sections
function generateLowerSections(): VenueSection[] {
  const sections: VenueSection[] = [];
  const numSections = 16;
  const anglePerSection = 360 / numSections;

  for (let i = 0; i < numSections; i++) {
    const startAngle = i * anglePerSection - 90; // Start from top
    const endAngle = startAngle + anglePerSection;
    const sectionNum = 101 + i;

    sections.push({
      id: sectionNum.toString(),
      name: `Section ${sectionNum}`,
      path: createArcSection(CX, CY, LOWER_INNER, LOWER_OUTER, startAngle, endAngle),
      labelPosition: getArcLabelPosition(CX, CY, LOWER_INNER, LOWER_OUTER, startAngle, endAngle),
      tier: 'lower',
    });
  }

  return sections;
}

// Generate upper bowl sections (300 level) - 24 sections
function generateUpperSections(): VenueSection[] {
  const sections: VenueSection[] = [];
  const numSections = 24;
  const anglePerSection = 360 / numSections;

  for (let i = 0; i < numSections; i++) {
    const startAngle = i * anglePerSection - 90; // Start from top
    const endAngle = startAngle + anglePerSection;
    const sectionNum = 301 + i;

    sections.push({
      id: sectionNum.toString(),
      name: `Section ${sectionNum}`,
      path: createArcSection(CX, CY, UPPER_INNER, UPPER_OUTER, startAngle, endAngle),
      labelPosition: getArcLabelPosition(CX, CY, UPPER_INNER, UPPER_OUTER, startAngle, endAngle),
      tier: 'upper',
    });
  }

  return sections;
}

// Generate floor sections - 4 sections around the court
function generateFloorSections(): VenueSection[] {
  const sections: VenueSection[] = [];

  // Floor sections in 4 quadrants
  const floorConfigs = [
    { id: 'Floor A', startAngle: -45, endAngle: 45 },
    { id: 'Floor B', startAngle: 45, endAngle: 135 },
    { id: 'Floor C', startAngle: 135, endAngle: 225 },
    { id: 'Floor D', startAngle: 225, endAngle: 315 },
  ];

  floorConfigs.forEach(({ id, startAngle, endAngle }) => {
    sections.push({
      id,
      name: id,
      path: createArcSection(CX, CY, FLOOR_INNER, FLOOR_OUTER, startAngle, endAngle),
      labelPosition: getArcLabelPosition(CX, CY, FLOOR_INNER, FLOOR_OUTER, startAngle, endAngle),
      tier: 'floor',
    });
  });

  return sections;
}

// Create the court/stage area (rounded rectangle)
function createCourtPath(): string {
  const rx = COURT_WIDTH;
  const ry = COURT_HEIGHT;
  const cornerRadius = 10;

  return `M ${CX - rx + cornerRadius} ${CY - ry}
          L ${CX + rx - cornerRadius} ${CY - ry}
          Q ${CX + rx} ${CY - ry} ${CX + rx} ${CY - ry + cornerRadius}
          L ${CX + rx} ${CY + ry - cornerRadius}
          Q ${CX + rx} ${CY + ry} ${CX + rx - cornerRadius} ${CY + ry}
          L ${CX - rx + cornerRadius} ${CY + ry}
          Q ${CX - rx} ${CY + ry} ${CX - rx} ${CY + ry - cornerRadius}
          L ${CX - rx} ${CY - ry + cornerRadius}
          Q ${CX - rx} ${CY - ry} ${CX - rx + cornerRadius} ${CY - ry}
          Z`;
}

/**
 * Create a generic arena map configuration
 */
export function createGenericArenaMap(
  venueId: string,
  venueName: string,
  courtLabel: string = 'COURT'
): VenueMapConfig {
  return {
    venueId,
    venueName,
    viewBox: '0 0 800 600',
    sections: [
      ...generateFloorSections(),
      ...generateLowerSections(),
      ...generateUpperSections(),
    ],
    courtArea: {
      path: createCourtPath(),
      label: courtLabel,
    },
  };
}

// Pre-generated arena for Staples Center
export const genericArenaMap = createGenericArenaMap(
  'venue-3',
  'Crypto.com Arena',
  'COURT'
);

export default genericArenaMap;
