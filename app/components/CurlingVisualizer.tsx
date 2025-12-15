'use client'

import { Suspense } from 'react'
import { CurlingSheet } from './CurlingSheet'
import { PatternSelector } from './PatternSelector'
import { HeatmapOverlay } from './HeatmapOverlay'
import { usePatternState } from '../hooks/usePatternState'

function CurlingVisualizerInner() {
  const {
    scrapeList,
    addPattern,
    removePattern,
    clearAll,
    canAddMore,
    maxListSize,
  } = usePatternState()

  return (
    <>
      <div className="pattern-selector-wrapper">
        <PatternSelector
          scrapeList={scrapeList}
          onAddPattern={addPattern}
          onRemovePattern={removePattern}
          onClearAll={clearAll}
          canAddMore={canAddMore}
          maxListSize={maxListSize}
        />
      </div>

      <div className="sheet-wrapper">
        <CurlingSheet>
          <HeatmapOverlay scrapeList={scrapeList} />
        </CurlingSheet>
      </div>
    </>
  )
}

// Wrap in Suspense for SSR compatibility with useSearchParams
export function CurlingVisualizer() {
  return (
    <Suspense fallback={<CurlingVisualizerLoading />}>
      <CurlingVisualizerInner />
    </Suspense>
  )
}

function CurlingVisualizerLoading() {
  return (
    <>
      <div className="pattern-selector-wrapper">
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '24px',
          minWidth: '280px',
          minHeight: '400px'
        }}>
          Loading...
        </div>
      </div>
      <div className="sheet-wrapper">
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '6px',
          width: '100%',
          maxWidth: '500px',
          aspectRatio: '14 / 28'
        }} />
      </div>
    </>
  )
}
