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
 * Get heat map color based on pass count
 */
export function getHeatmapColor(passCount: number): string {
  const colors: Record<number, string> = {
    1: '#3b82f6', // Blue
    2: '#06b6d4', // Cyan
    3: '#22c55e', // Green
    4: '#eab308', // Yellow
    5: '#f97316', // Orange
  }

  if (passCount <= 0) return 'transparent'
  if (passCount >= 6) return '#ef4444' // Red for 6+
  return colors[passCount] || '#ef4444'
}

/**
 * Get text color for heat map labels (for contrast)
 */
export function getHeatmapTextColor(passCount: number): string {
  // Dark text for light backgrounds (yellow), white for others
  if (passCount === 4) return '#1f2937' // Dark gray for yellow
  return '#ffffff'
}
