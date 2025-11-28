'use client'

import { useState } from 'react'
import './PatternOverlay.css'

// Sheet is 14ft wide, sidelines are 2.5ft each
const SHEET_WIDTH_FT = 14
const SIDELINE_WIDTH_FT = 2.5

// Convert feet to percentage of sheet width
function ftToPercent(ft: number): number {
  return (ft / SHEET_WIDTH_FT) * 100
}

export function SidelinesOverlay() {
  const [hoveredLane, setHoveredLane] = useState<number | null>(null)

  const color = 'rgba(100, 180, 255, 0.2)'
  const borderColor = 'rgba(100, 180, 255, 0.6)'
  const hoverColor = 'rgba(100, 180, 255, 0.4)'

  const sidelines = [
    { startFt: 0, widthFt: SIDELINE_WIDTH_FT },
    { startFt: SHEET_WIDTH_FT - SIDELINE_WIDTH_FT, widthFt: SIDELINE_WIDTH_FT },
  ]

  return (
    <>
      {sidelines.map((lane, index) => {
        const isHovered = hoveredLane === index

        return (
          <div
            key={`sideline-${index}`}
            className={`scrape-lane ${isHovered ? 'highlighted' : ''}`}
            style={{
              left: `${ftToPercent(lane.startFt)}%`,
              width: `${ftToPercent(lane.widthFt)}%`,
              backgroundColor: isHovered ? hoverColor : color,
              borderLeft: `2px solid ${borderColor}`,
              borderRight: `2px solid ${borderColor}`,
            }}
            onMouseEnter={() => setHoveredLane(index)}
            onMouseLeave={() => setHoveredLane(null)}
          />
        )
      })}
    </>
  )
}
