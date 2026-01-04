'use client'

import { Suspense, useMemo, useState } from 'react'
import { CurlingSheet } from './CurlingSheet'
import { PatternSelector } from './PatternSelector'
import { HeatmapOverlay } from './HeatmapOverlay'
import { usePatternState } from '../hooks/usePatternState'
import { getPatternLanes } from './PatternOverlay'

function CurlingVisualizerInner() {
  const {
    scrapeList,
    addPattern,
    removePattern,
    updateAngle,
    updateInside,
    clearAll,
    canAddMore,
    maxListSize,
  } = usePatternState()
  const [activePass, setActivePass] = useState<{ entryIndex: number; passIndex: number } | null>(null)

  const maxPassCounts = useMemo(() => {
    return scrapeList.map((entry) => getPatternLanes(entry.patternKey, 0, 0).length)
  }, [scrapeList])

  const handleSelectPass = (entryIndex: number, passIndex: number) => {
    setActivePass((prev) => {
      if (prev?.entryIndex === entryIndex && prev?.passIndex === passIndex) {
        return null
      }
      return { entryIndex, passIndex }
    })
  }

  return (
    <>
      <div className="pattern-selector-wrapper">
        <PatternSelector
          scrapeList={scrapeList}
          onAddPattern={addPattern}
          onRemovePattern={removePattern}
          onUpdateAngle={updateAngle}
          onUpdateInside={updateInside}
          onClearAll={clearAll}
          canAddMore={canAddMore}
          maxListSize={maxListSize}
          onSelectPass={handleSelectPass}
          activePass={activePass}
          passCounts={maxPassCounts}
        />
      </div>

      <div className="sheet-wrapper">
        <CurlingSheet>
          <HeatmapOverlay scrapeList={scrapeList} activePass={activePass} />
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
