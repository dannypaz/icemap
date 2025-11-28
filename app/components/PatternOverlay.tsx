'use client'

import { useState } from 'react'
import './PatternOverlay.css'

// Sheet is 14ft wide, scraper is 5ft wide
const SHEET_WIDTH_FT = 14
const SCRAPER_WIDTH_FT = 5
const CENTER_FT = SHEET_WIDTH_FT / 2 // 7ft

// Hole overlaps in feet
const ONE_HOLE_FT = 2 / 12  // 2 inches = 0.167ft
const TWO_HOLE_FT = 8 / 12  // 8 inches = 0.667ft
const TWO_HALF_HOLE_FT = 12 / 12  // 12 inches = 1ft (2.5 hole)
const EDGE_OVERLAP_FT = 3 / 12  // 3 inches over the side = 0.25ft

interface Lane {
  startFt: number
  widthFt: number
  direction: 'down' | 'up'
}

interface PatternConfig {
  color: string
  borderColor: string
  hoverColor: string
  lanes: Lane[]
}

// Lane positions ordered by pass sequence: middle out, alternating down/up
const PATTERNS: Record<string, PatternConfig> = {
  '3-pass': {
    // Start center, then left, then right
    color: 'rgba(0, 200, 100, 0.2)',
    borderColor: 'rgba(0, 200, 100, 0.6)',
    hoverColor: 'rgba(0, 200, 100, 0.4)',
    lanes: [
      { startFt: 4.5, widthFt: SCRAPER_WIDTH_FT, direction: 'down' },  // Pass 1: Center - DOWN
      { startFt: 0, widthFt: SCRAPER_WIDTH_FT, direction: 'up' },      // Pass 2: Left - UP
      { startFt: 9, widthFt: SCRAPER_WIDTH_FT, direction: 'down' },    // Pass 3: Right - DOWN
    ],
  },
  '4-pass (1-hole)': {
    // Start from inside (near center) and work out
    // Outside passes overlap 3" past sheet edge
    color: 'rgba(255, 150, 0, 0.2)',
    borderColor: 'rgba(255, 150, 0, 0.6)',
    hoverColor: 'rgba(255, 150, 0, 0.4)',
    lanes: [
      { startFt: CENTER_FT + ONE_HOLE_FT - SCRAPER_WIDTH_FT, widthFt: SCRAPER_WIDTH_FT, direction: 'down' }, // Pass 1: Left inside - DOWN
      { startFt: CENTER_FT - ONE_HOLE_FT, widthFt: SCRAPER_WIDTH_FT, direction: 'up' },                      // Pass 2: Right inside - UP
      { startFt: -EDGE_OVERLAP_FT, widthFt: SCRAPER_WIDTH_FT, direction: 'down' },                           // Pass 3: Left outside (3" over edge) - DOWN
      { startFt: SHEET_WIDTH_FT - SCRAPER_WIDTH_FT + EDGE_OVERLAP_FT, widthFt: SCRAPER_WIDTH_FT, direction: 'up' }, // Pass 4: Right outside (3" over edge) - UP
    ],
  },
  '5-pass (2-hole)': {
    // Center first, then inside passes, then outside
    // Outside passes overlap 3" past sheet edge
    color: 'rgba(150, 0, 255, 0.2)',
    borderColor: 'rgba(150, 0, 255, 0.6)',
    hoverColor: 'rgba(150, 0, 255, 0.4)',
    lanes: [
      { startFt: CENTER_FT - SCRAPER_WIDTH_FT / 2, widthFt: SCRAPER_WIDTH_FT, direction: 'down' },           // Pass 1: Center - DOWN
      { startFt: CENTER_FT + TWO_HOLE_FT - SCRAPER_WIDTH_FT, widthFt: SCRAPER_WIDTH_FT, direction: 'up' },   // Pass 2: Left inside - UP
      { startFt: CENTER_FT - TWO_HOLE_FT, widthFt: SCRAPER_WIDTH_FT, direction: 'down' },                    // Pass 3: Right inside - DOWN
      { startFt: -EDGE_OVERLAP_FT, widthFt: SCRAPER_WIDTH_FT, direction: 'up' },                             // Pass 4: Left outside (3" over edge) - UP
      { startFt: SHEET_WIDTH_FT - SCRAPER_WIDTH_FT + EDGE_OVERLAP_FT, widthFt: SCRAPER_WIDTH_FT, direction: 'down' }, // Pass 5: Right outside (3" over edge) - DOWN
    ],
  },
  '6-pass (2-hole)': {
    // Start from innermost (2.5 hole / 12" overlap) and work out
    // Passes 1-2: 2.5 hole (~12" past center)
    // Passes 3-4: 2 hole (~8" past center)
    // Passes 5-6: Outside (3" over edge)
    color: 'rgba(220, 50, 100, 0.2)',
    borderColor: 'rgba(220, 50, 100, 0.6)',
    hoverColor: 'rgba(220, 50, 100, 0.4)',
    lanes: [
      { startFt: CENTER_FT + TWO_HALF_HOLE_FT - SCRAPER_WIDTH_FT, widthFt: SCRAPER_WIDTH_FT, direction: 'down' }, // Pass 1: Left innermost (12" past center) - DOWN
      { startFt: CENTER_FT - TWO_HALF_HOLE_FT, widthFt: SCRAPER_WIDTH_FT, direction: 'up' },                      // Pass 2: Right innermost (12" past center) - UP
      { startFt: CENTER_FT + TWO_HOLE_FT - SCRAPER_WIDTH_FT, widthFt: SCRAPER_WIDTH_FT, direction: 'down' },      // Pass 3: Left inside (8" past center) - DOWN
      { startFt: CENTER_FT - TWO_HOLE_FT, widthFt: SCRAPER_WIDTH_FT, direction: 'up' },                           // Pass 4: Right inside (8" past center) - UP
      { startFt: -EDGE_OVERLAP_FT, widthFt: SCRAPER_WIDTH_FT, direction: 'down' },                                // Pass 5: Left outside (3" over edge) - DOWN
      { startFt: SHEET_WIDTH_FT - SCRAPER_WIDTH_FT + EDGE_OVERLAP_FT, widthFt: SCRAPER_WIDTH_FT, direction: 'up' }, // Pass 6: Right outside (3" over edge) - UP
    ],
  },
}

// Convert feet to percentage of sheet width
function ftToPercent(ft: number): number {
  return (ft / SHEET_WIDTH_FT) * 100
}

interface PatternOverlayProps {
  patternId: string
  showLabels?: boolean
}

export function PatternOverlay({ patternId, showLabels = true }: PatternOverlayProps) {
  const [hoveredLane, setHoveredLane] = useState<number | null>(null)
  const pattern = PATTERNS[patternId]
  if (!pattern) return null

  return (
    <>
      {pattern.lanes.map((lane, index) => {
        const isDown = lane.direction === 'down'
        const isHovered = hoveredLane === index

        return (
          <div
            key={`${patternId}-${index}`}
            className={`scrape-lane ${isDown ? 'direction-down' : 'direction-up'} ${isHovered ? 'highlighted' : ''}`}
            style={{
              left: `${ftToPercent(lane.startFt)}%`,
              width: `${ftToPercent(lane.widthFt)}%`,
              backgroundColor: isHovered ? pattern.hoverColor : pattern.color,
              borderLeft: `2px solid ${pattern.borderColor}`,
              borderRight: `2px solid ${pattern.borderColor}`,
            }}
          >
            {showLabels && (
              <div
                className="lane-label"
                onMouseEnter={() => setHoveredLane(index)}
                onMouseLeave={() => setHoveredLane(null)}
              >
                <span className="pass-number">Pass {index + 1}</span>
                <div className={`direction-arrow ${isDown ? 'arrow-down' : 'arrow-up'}`}>
                  {isDown ? '↓' : '↑'}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}

export { PATTERNS }
