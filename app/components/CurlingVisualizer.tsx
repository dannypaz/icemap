'use client'

import { Suspense, useMemo, useState } from 'react'
import { CurlingSheet } from './CurlingSheet'
import { PatternSelector, ActiveHighlight } from './PatternSelector'
import { HeatmapOverlay } from './HeatmapOverlay'
import { usePatternState } from '../hooks/usePatternState'
import { getPassLanes } from './PatternOverlay'
import { ANGLED_BLADE_DEG, INSIDE_OFFSET_FT } from '../lib/calibrations'

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
  const [activeHighlight, setActiveHighlight] = useState<ActiveHighlight | null>(null)

  const maxPassCounts = useMemo(() => {
    return scrapeList.map((entry) => {
      const angleDeg = entry.angleOn ? ANGLED_BLADE_DEG : 0
      const insideOffset = entry.inside ? INSIDE_OFFSET_FT : 0
      return getPassLanes(entry.patternKey, angleDeg, insideOffset).length
    })
  }, [scrapeList])

  const handleSelectHighlight = (selection: ActiveHighlight) => {
    setActiveHighlight((prev) => {
      if (
        prev &&
        prev.entryIndex === selection.entryIndex &&
        prev.mode === selection.mode &&
        ((prev.mode === 'pass' && selection.mode === 'pass' && prev.passIndex === selection.passIndex) ||
          (prev.mode === 'group' &&
            selection.mode === 'group' &&
            prev.groupId === selection.groupId))
      ) {
        return null
      }
      return selection
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
          onSelectHighlight={handleSelectHighlight}
          activeHighlight={activeHighlight}
          passCounts={maxPassCounts}
        />
      </div>

      <div className="sheet-wrapper">
        <CurlingSheet>
          <HeatmapOverlay scrapeList={scrapeList} activeHighlight={activeHighlight} />
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
