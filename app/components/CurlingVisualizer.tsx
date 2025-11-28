'use client'

import { Suspense, useState } from 'react'
import { CurlingSheet } from './CurlingSheet'
import { PatternSelector } from './PatternSelector'
import { PatternOverlay } from './PatternOverlay'
import { HeatmapOverlay } from './HeatmapOverlay'
import { usePatternState } from '../hooks/usePatternState'

export type ViewMode = 'patterns' | 'heatmap'

function CurlingVisualizerInner() {
  const {
    scrapeList,
    addPattern,
    removePattern,
    clearAll,
    canAddMore,
    maxListSize,
  } = usePatternState()

  const [previewPattern, setPreviewPattern] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('patterns')

  // Clear preview when switching to heatmap mode
  const handleViewModeChange = (mode: ViewMode) => {
    if (mode === 'heatmap') {
      setPreviewPattern(null)
    }
    setViewMode(mode)
  }

  // Show labels when exactly 1 pattern visible (only in patterns mode when previewing)
  const showLabels = viewMode === 'patterns' && previewPattern !== null

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
          previewPattern={previewPattern}
          onPreviewPattern={setPreviewPattern}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />
      </div>

      <div className="sheet-wrapper">
        <CurlingSheet>
          {viewMode === 'patterns' ? (
            /* Patterns mode - only show preview pattern */
            previewPattern && (
              <PatternOverlay
                key={`preview-${previewPattern}`}
                patternId={previewPattern}
                showLabels={true}
                isPreview={true}
              />
            )
          ) : (
            /* Heatmap view - render calculated coverage zones */
            <HeatmapOverlay scrapeList={scrapeList} />
          )}
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
