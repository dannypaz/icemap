'use client'

import { useState } from 'react'
import { CurlingSheet } from './CurlingSheet'
import { PatternSelector } from './PatternSelector'
import { PatternOverlay } from './PatternOverlay'
import { SidelinesOverlay } from './SidelinesOverlay'

export function CurlingVisualizer() {
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>(['3-pass'])
  const [withSidelines, setWithSidelines] = useState(false)

  const handleToggle = (patternId: string) => {
    setSelectedPatterns((prev) =>
      prev.includes(patternId)
        ? prev.filter((p) => p !== patternId)
        : [...prev, patternId]
    )
  }

  const handleToggleSidelines = () => {
    setWithSidelines((prev) => !prev)
  }

  // Only show labels when exactly 1 pattern is selected
  const showLabels = selectedPatterns.length === 1

  return (
    <>
      <div className="pattern-selector-wrapper">
        <PatternSelector
          selectedPatterns={selectedPatterns}
          onToggle={handleToggle}
          withSidelines={withSidelines}
          onToggleSidelines={handleToggleSidelines}
        />
      </div>

      <div className="sheet-wrapper">
        <CurlingSheet>
          {selectedPatterns.map((patternId) => (
            <PatternOverlay
              key={patternId}
              patternId={patternId}
              showLabels={showLabels}
            />
          ))}
          {withSidelines && <SidelinesOverlay />}
        </CurlingSheet>
      </div>
    </>
  )
}
