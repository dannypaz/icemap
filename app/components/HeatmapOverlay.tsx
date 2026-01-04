'use client'

import { useMemo } from 'react'
import { calculateCoverageZones, getHeatmapColor, getHeatmapTextColor, Lane } from './CoverageCalculator'
import { getPatternLanes, getPassLanes, getHighlightGroupById } from './PatternOverlay'
import './HeatmapOverlay.css'
import { ANGLED_BLADE_DEG, INSIDE_OFFSET_FT, SHEET_WIDTH_FT } from '../lib/calibrations'
import type { ActiveHighlight } from './PatternSelector'

interface HeatmapOverlayProps {
  scrapeList: { patternKey: string; angleOn: boolean; inside: boolean }[]
  activeHighlight?: ActiveHighlight | null
}

export function HeatmapOverlay({ scrapeList, activeHighlight }: HeatmapOverlayProps) {
  // Collect all lanes from all patterns in the scrape list
  const allLanes = useMemo(() => {
    const lanes: Lane[] = []

    for (const entry of scrapeList) {
      const angleDeg = entry.angleOn ? ANGLED_BLADE_DEG : 0
      const insideOffset = entry.inside ? INSIDE_OFFSET_FT : 0
      const patternLanes = getPatternLanes(entry.patternKey, angleDeg, insideOffset)
      for (const lane of patternLanes) {
        lanes.push({
          startFt: lane.startFt,
          widthFt: lane.widthFt,
        })
      }
    }

    return lanes
  }, [scrapeList])

  // Calculate coverage zones
  const zones = useMemo(() => {
    return calculateCoverageZones(allLanes)
  }, [allLanes])

  const highlightLanes = useMemo(() => {
    if (!activeHighlight) return []
    const entry = scrapeList[activeHighlight.entryIndex]
    if (!entry) return []
    const angleDeg = entry.angleOn ? ANGLED_BLADE_DEG : 0
    const insideOffset = entry.inside ? INSIDE_OFFSET_FT : 0

    if (activeHighlight.mode === 'pass') {
      const lanes = getPassLanes(entry.patternKey, angleDeg, insideOffset)
      const lane = lanes[activeHighlight.passIndex - 1]
      if (!lane || lane.widthFt <= 0) return []
      return [lane]
    }

    const group = getHighlightGroupById(entry.patternKey, activeHighlight.groupId)
    if (!group) return []
    const lanes = getPatternLanes(entry.patternKey, angleDeg, insideOffset)
    const selected: Lane[] = []
    for (const laneIndex of group.laneIndexes) {
      const lane = lanes[laneIndex]
      if (lane && lane.widthFt > 0) {
        selected.push(lane)
      }
    }
    return selected
  }, [activeHighlight, scrapeList])

  // Convert feet to percentage
  const ftToPercent = (ft: number) => (ft / SHEET_WIDTH_FT) * 100

  if (zones.length === 0) {
    return null
  }

  return (
    <div className="heatmap-overlay">
      {highlightLanes.map((lane, laneIndex) => (
        <div
          key={`highlight-${laneIndex}`}
          className="highlight-lane"
          style={{
            left: `${ftToPercent(lane.startFt)}%`,
            width: `${ftToPercent(lane.widthFt)}%`,
          }}
        />
      ))}
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
