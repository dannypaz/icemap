'use client'

import { useState } from 'react'
import { getHeatmapColor } from './CoverageCalculator'
import { PATTERNS } from './PatternOverlay'
import './PatternSelector.css'

interface PatternSelectorProps {
  scrapeList: string[]
  onAddPattern: (patternId: string) => void
  onRemovePattern: (index: number) => void
  onClearAll: () => void
  canAddMore: boolean
  maxListSize: number
}

const PATTERN_INFO: Record<string, { label: string; shortLabel: string; description: string }> = {
  '3-pass-sidelines': {
    label: '3-Pass with Sidelines',
    shortLabel: '3P+S',
    description: 'Full coverage + 2.5ft sides',
  },
  '4-pass (1-hole)': {
    label: '4-Pass',
    shortLabel: '4P',
    description: '2" overlap',
  },
  '5-pass (2-hole)': {
    label: '5-Pass',
    shortLabel: '5P',
    description: '8" overlap',
  },
  '6-pass (2-hole)': {
    label: '6-Pass',
    shortLabel: '6P',
    description: '12" + 8" overlap',
  },
}

export function PatternSelector({
  scrapeList,
  onAddPattern,
  onRemovePattern,
  onClearAll,
  canAddMore,
  maxListSize,
}: PatternSelectorProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleAddClick = (patternKey: string) => {
    onAddPattern(patternKey)
  }

  const legendValues = [1, 3, 5, 8, 12, 16]

  return (
    <div className="pattern-selector">
      <h2>Heat Map Builder</h2>
      <p className="selector-description">
        Build your scrape sequence ({scrapeList.length}/{maxListSize}) to visualize coverage on the heat map.
      </p>

      <div className="heatmap-legend">
        <h3>Heat Map Legend</h3>
        <div className="legend-items">
          {legendValues.map((value) => (
            <div key={`legend-${value}`} className="legend-item">
              <span
                className="legend-color"
                style={{ backgroundColor: getHeatmapColor(value) }}
              />
              <span className="legend-label">
                {value}+ {value === 1 ? 'pass' : 'passes'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Current Scrape Pattern */}
      <div className="scrape-list-section">
        <div className="scrape-list-header">
          <h3>Current Sequence</h3>
          {scrapeList.length > 0 && (
            <button className="clear-all-btn" onClick={onClearAll}>
              Clear All
            </button>
          )}
        </div>

        {scrapeList.length === 0 ? (
          <div className="empty-list">Add patterns below to build your sequence</div>
        ) : (
          <div className="scrape-list">
            {scrapeList.map((patternKey, index) => {
              const info = PATTERN_INFO[patternKey]
              const pattern = PATTERNS[patternKey]
              return (
                <div key={`${patternKey}-${index}`} className="scrape-list-item">
                  <span className="item-number">{index + 1}</span>
                  <span
                    className="item-color"
                    style={{ backgroundColor: pattern?.color.replace('0.25', '0.7') }}
                  />
                  <span className="item-label">{info?.shortLabel || patternKey}</span>
                  <button
                    className="remove-btn"
                    onClick={() => onRemovePattern(index)}
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Pattern Buttons */}
      <div className="add-pattern-section">
        <h3>Add Pattern</h3>
        <div className="pattern-buttons add-mode">
          {Object.keys(PATTERNS).map((patternKey) => {
            const info = PATTERN_INFO[patternKey]
            const pattern = PATTERNS[patternKey]

            return (
              <button
                key={patternKey}
                className="add-pattern-btn"
                onClick={() => handleAddClick(patternKey)}
                disabled={!canAddMore}
              >
                <span
                  className="btn-color"
                  style={{ backgroundColor: pattern.color.replace('0.25', '0.7') }}
                />
                <div className="btn-text">
                  <span className="btn-label">{info?.label}</span>
                  <span className="btn-description">{info?.description}</span>
                </div>
                <span className="add-icon">+</span>
              </button>
            )
          })}
        </div>
        {!canAddMore && (
          <p className="add-hint">
            Maximum of {maxListSize} patterns reached. Remove a pass above to add another.
          </p>
        )}
      </div>

      {/* Share Section */}
      <div className="share-section">
        <button
          className={`copy-link-button ${copied ? 'copied' : ''}`}
          onClick={handleCopyLink}
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        <p className="share-hint">Share your scrape pattern via URL</p>
      </div>
    </div>
  )
}
