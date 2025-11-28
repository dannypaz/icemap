// Coverage Calculator - computes overlap zones across the sheet

export interface Lane {
  startFt: number
  widthFt: number
}

export interface CoverageZone {
  startFt: number
  endFt: number
  passCount: number
}

// Sheet boundaries
const SHEET_WIDTH_FT = 14

/**
 * Calculate coverage zones from a list of lanes
 * Returns zones with their pass counts (how many lanes overlap in each zone)
 */
export function calculateCoverageZones(lanes: Lane[]): CoverageZone[] {
  if (lanes.length === 0) return []

  // Collect all unique boundary points (clipped to sheet bounds)
  const boundaries = new Set<number>()
  boundaries.add(0) // Sheet start
  boundaries.add(SHEET_WIDTH_FT) // Sheet end

  for (const lane of lanes) {
    const start = Math.max(0, lane.startFt)
    const end = Math.min(SHEET_WIDTH_FT, lane.startFt + lane.widthFt)

    if (start < SHEET_WIDTH_FT) boundaries.add(start)
    if (end > 0) boundaries.add(end)
  }

  // Sort boundaries
  const sortedBoundaries = Array.from(boundaries).sort((a, b) => a - b)

  // Calculate coverage for each zone between consecutive boundaries
  const zones: CoverageZone[] = []

  for (let i = 0; i < sortedBoundaries.length - 1; i++) {
    const zoneStart = sortedBoundaries[i]
    const zoneEnd = sortedBoundaries[i + 1]
    const zoneMid = (zoneStart + zoneEnd) / 2

    // Count how many lanes cover this zone
    let passCount = 0
    for (const lane of lanes) {
      const laneStart = lane.startFt
      const laneEnd = lane.startFt + lane.widthFt

      // Check if this lane covers the zone midpoint
      if (laneStart <= zoneMid && laneEnd >= zoneMid) {
        passCount++
      }
    }

    // Only add zones that have at least one pass
    if (passCount > 0) {
      zones.push({
        startFt: zoneStart,
        endFt: zoneEnd,
        passCount,
      })
    }
  }

  return zones
}

/**
 * Get heat map color based on pass count (supports 1-20+ overlaps)
 * Gradient: Blue -> Cyan -> Green -> Yellow -> Orange -> Red -> Dark Red
 */
export function getHeatmapColor(passCount: number): string {
  const colors: Record<number, string> = {
    1: '#60a5fa',  // Light blue
    2: '#3b82f6',  // Blue
    3: '#2563eb',  // Darker blue
    4: '#0891b2',  // Cyan
    5: '#06b6d4',  // Light cyan
    6: '#14b8a6',  // Teal
    7: '#10b981',  // Emerald
    8: '#22c55e',  // Green
    9: '#84cc16',  // Lime
    10: '#a3e635', // Light lime
    11: '#facc15', // Yellow
    12: '#eab308', // Amber
    13: '#f59e0b', // Orange-yellow
    14: '#f97316', // Orange
    15: '#ea580c', // Dark orange
    16: '#dc2626', // Red
    17: '#b91c1c', // Dark red
    18: '#991b1b', // Darker red
    19: '#7f1d1d', // Very dark red
    20: '#450a0a', // Maroon
  }

  if (passCount <= 0) return 'transparent'
  if (passCount > 20) return '#450a0a' // Maroon for 20+
  return colors[passCount] || '#450a0a'
}

/**
 * Get text color for heat map labels (for contrast)
 */
export function getHeatmapTextColor(passCount: number): string {
  // Dark text for light/yellow backgrounds, white for others
  if (passCount >= 9 && passCount <= 13) return '#1f2937' // Dark gray for yellow/lime
  return '#ffffff'
}
