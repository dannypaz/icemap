'use client'

import { PATTERNS } from './PatternOverlay'
import './PatternSelector.css'

interface PatternSelectorProps {
  selectedPatterns: string[]
  onToggle: (patternId: string) => void
  withSidelines: boolean
  onToggleSidelines: () => void
}

const PATTERN_INFO: Record<string, { label: string; description: string }> = {
  '3-pass': {
    label: '3-Pass',
    description: 'Standard full coverage',
  },
  '4-pass (1-hole)': {
    label: '4-Pass (1-hole)',
    description: '~2" overlap past center, 3" over edges',
  },
  '5-pass (2-hole)': {
    label: '5-Pass (2-hole)',
    description: 'Center cut + ~8" overlap, 3" over edges',
  },
  '6-pass (2-hole)': {
    label: '6-Pass (2-hole)',
    description: 'Heavy scrape, ~8" overlap, 3" over edges',
  },
}

export function PatternSelector({
  selectedPatterns,
  onToggle,
  withSidelines,
  onToggleSidelines
}: PatternSelectorProps) {
  return (
    <div className="pattern-selector">
      <h2>Scrape Patterns</h2>
      <p className="selector-description">
        Select patterns to visualize. Overlapping areas appear darker.
      </p>
      <div className="pattern-options">
        {Object.keys(PATTERNS).map((patternId) => {
          const info = PATTERN_INFO[patternId]
          const pattern = PATTERNS[patternId]
          const isSelected = selectedPatterns.includes(patternId)

          return (
            <label
              key={patternId}
              className={`pattern-option ${isSelected ? 'selected' : ''}`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(patternId)}
              />
              <span
                className="color-swatch"
                style={{ backgroundColor: pattern.color.replace('0.2', '0.7') }}
              />
              <div className="pattern-info">
                <span className="pattern-label">{info.label}</span>
                <span className="pattern-description">{info.description}</span>
              </div>
            </label>
          )
        })}
      </div>

      <div className="sidelines-option">
        <label className={`pattern-option sideline-toggle ${withSidelines ? 'selected' : ''}`}>
          <input
            type="checkbox"
            checked={withSidelines}
            onChange={onToggleSidelines}
          />
          <span
            className="color-swatch"
            style={{ backgroundColor: 'rgba(100, 180, 255, 0.7)' }}
          />
          <div className="pattern-info">
            <span className="pattern-label">With Sidelines</span>
            <span className="pattern-description">2.5ft passes on each side</span>
          </div>
        </label>
      </div>

      <div className="legend">
        <h3>Sheet Info</h3>
        <ul>
          <li><strong>Width:</strong> 14 feet</li>
          <li><strong>Scraper blade:</strong> 5 feet</li>
          <li><strong>1-hole:</strong> ~2&quot; past center</li>
          <li><strong>2-hole:</strong> ~8&quot; past center</li>
          <li><strong>Edge overlap:</strong> ~3&quot; past sides</li>
          <li><strong>Sidelines:</strong> 2.5ft each side</li>
        </ul>
        <h3>Directions</h3>
        <ul>
          <li><strong>↓</strong> = Down pass</li>
          <li><strong>↑</strong> = Up pass</li>
        </ul>
      </div>
    </div>
  )
}
