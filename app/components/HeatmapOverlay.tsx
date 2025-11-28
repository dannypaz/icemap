'use client'

import { useMemo } from 'react'
import { calculateCoverageZones, getHeatmapColor, getHeatmapTextColor, Lane } from './CoverageCalculator'
import { PATTERNS } from './PatternOverlay'
import './HeatmapOverlay.css'

const SHEET_WIDTH_FT = 14

interface HeatmapOverlayProps {
  scrapeList: string[]
}

export function HeatmapOverlay({ scrapeList }: HeatmapOverlayProps) {
  // Collect all lanes from all patterns in the scrape list
  const allLanes = useMemo(() => {
    const lanes: Lane[] = []

    for (const patternKey of scrapeList) {
      const pattern = PATTERNS[patternKey]
      if (pattern) {
        for (const lane of pattern.lanes) {
          lanes.push({
            startFt: lane.startFt,
            widthFt: lane.widthFt,
          })
        }
      }
    }

    return lanes
  }, [scrapeList])

  // Calculate coverage zones
  const zones = useMemo(() => {
    return calculateCoverageZones(allLanes)
  }, [allLanes])

  // Convert feet to percentage
  const ftToPercent = (ft: number) => (ft / SHEET_WIDTH_FT) * 100

  if (zones.length === 0) {
    return null
  }

  return (
    <div className="heatmap-overlay">
      {zones.map((zone, index) => {
        const color = getHeatmapColor(zone.passCount)
        const textColor = getHeatmapTextColor(zone.passCount)
        const widthPercent = ftToPercent(zone.endFt - zone.startFt)

        return (
          <div
            key={`zone-${index}`}
            className="heatmap-zone"
            style={{
              left: `${ftToPercent(zone.startFt)}%`,
              width: `${widthPercent}%`,
              backgroundColor: color,
            }}
          >
            {/* Show number - scale down for narrow zones, hide for very narrow */}
            {widthPercent >= 3 && (
              <span
                className={`zone-count ${widthPercent < 8 ? 'zone-count-small' : ''}`}
                style={{ color: textColor }}
              >
                {zone.passCount}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
