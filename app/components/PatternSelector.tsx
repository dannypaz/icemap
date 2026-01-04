"use client";

import { useMemo, useState } from "react";
import { calculateCoverageZones, getHeatmapColor } from "./CoverageCalculator";
import {
  getEffectiveBladeWidth,
  getPatternLanes,
  PATTERNS,
} from "./PatternOverlay";
import "./PatternSelector.css";
import {
  ANGLED_BLADE_DEG,
  INSIDE_OFFSET_FT,
  SCRAPER_WIDTH_FT,
  SHEET_WIDTH_FT,
} from "../lib/calibrations";

interface PatternSelectorProps {
  scrapeList: { patternKey: string; angleOn: boolean; inside: boolean }[];
  onAddPattern: (
    patternId: string,
    angleOn?: boolean,
    inside?: boolean
  ) => void;
  onRemovePattern: (index: number) => void;
  onUpdateAngle: (index: number, angleOn: boolean) => void;
  onUpdateInside: (index: number, inside: boolean) => void;
  onClearAll: () => void;
  canAddMore: boolean;
  maxListSize: number;
  onSelectPass: (entryIndex: number, passIndex: number) => void;
  activePass: { entryIndex: number; passIndex: number } | null;
  passCounts: number[];
}

const PATTERN_INFO: Record<
  string,
  { label: string; shortLabel: string; description: string }
> = {
  "3-pass (sidelines)": {
    label: "3-Pass",
    shortLabel: "3P",
    description: "Straight, centered on sidelines",
  },
  "4-pass (1.5-hole)": {
    label: "4-Pass",
    shortLabel: "4P",
    description: '1.5 hole overlap, 3" inside edges',
  },
  "4-pass (2.5-hole)": {
    label: "4-Pass (2.5)",
    shortLabel: "4P",
    description: '2.5 hole overlap, 3" inside edges',
  },
  "5-pass (2.5-hole)": {
    label: "5-Pass (2 1/2)",
    shortLabel: "5P",
    description: 'Center straight, 2.5 hole overlap, 6" inside edges',
  },
  "5-pass (1.5-hole)": {
    label: "5-Pass (1 1/2)",
    shortLabel: "5P",
    description: 'Center straight, 1.5 hole overlap, 6" inside edges',
  },
  "6-pass (4/2/0)": {
    label: "6-Pass (4/2/0)",
    shortLabel: "6P",
    description: "4-hole, 2-hole, side line",
  },
  "6-pass (3/1/0)": {
    label: "6-Pass (3/1/0)",
    shortLabel: "6P",
    description: "3-hole, 1-hole, side line",
  },
};

const DEFAULT_ADD_OPTIONS: Record<
  string,
  { angleOn: boolean; inside: boolean }
> = {
  "3-pass (sidelines)": { angleOn: false, inside: false },
  "4-pass (1.5-hole)": { angleOn: true, inside: false },
  "4-pass (2.5-hole)": { angleOn: true, inside: false },
  "5-pass (2.5-hole)": { angleOn: true, inside: false },
  "5-pass (1.5-hole)": { angleOn: true, inside: false },
  "6-pass (4/2/0)": { angleOn: true, inside: false },
  "6-pass (3/1/0)": { angleOn: true, inside: false },
};

const SNAPSHOT_WIDTH_PX = 1200;
const SNAPSHOT_HEIGHT_PX = 900;
const SNAPSHOT_MARGIN_PX = 40;
const SHEET_VISIBLE_LENGTH_FT = 28;

export function PatternSelector({
  scrapeList,
  onAddPattern,
  onRemovePattern,
  onUpdateAngle,
  onUpdateInside,
  onClearAll,
  canAddMore,
  maxListSize,
  onSelectPass,
  activePass,
  passCounts,
}: PatternSelectorProps) {
  const [copied, setCopied] = useState(false);
  const [addOptions] =
    useState<Record<string, { angleOn: boolean; inside: boolean }>>(
      DEFAULT_ADD_OPTIONS
    );

  const addPatternKeys = useMemo(() => Object.keys(PATTERNS), []);

  const formatAngleLabel = (angleOn: boolean) =>
    angleOn ? `Angle ${ANGLED_BLADE_DEG}°` : "No angle";

  const formatInsideLabel = (inside: boolean) =>
    inside ? '6" inside' : '3" edge';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleAddClick = (patternKey: string) => {
    const options = addOptions[patternKey] ?? { angleOn: false, inside: false };
    onAddPattern(patternKey, options.angleOn, options.inside);
  };

  const buildSnapshotSvg = () => {
    const sheetWidthPx = 420;
    const sheetHeightPx = sheetWidthPx * 2;
    const sheetX = SNAPSHOT_MARGIN_PX;
    const sheetY = (SNAPSHOT_HEIGHT_PX - sheetHeightPx) / 2;
    const summaryX = sheetX + sheetWidthPx + 60;
    const summaryY = sheetY + 10;
    const summaryLineHeight = 22;

    const lanes = scrapeList.flatMap((entry) => {
      const angleDeg = entry.angleOn ? ANGLED_BLADE_DEG : 0;
      const insideOffset = entry.inside ? INSIDE_OFFSET_FT : 0;
      return getPatternLanes(entry.patternKey, angleDeg, insideOffset).map(
        (lane) => ({
          startFt: lane.startFt,
          widthFt: lane.widthFt,
        })
      );
    });
    const zones = calculateCoverageZones(lanes);

    const summaryByPassCount = zones.reduce<Record<number, number>>(
      (acc, zone) => {
        acc[zone.passCount] =
          (acc[zone.passCount] ?? 0) + (zone.endFt - zone.startFt);
        return acc;
      },
      {}
    );

    const summaryRows = Object.entries(summaryByPassCount)
      .map(([passCount, widthFt]) => ({
        passCount: Number(passCount),
        widthFt,
        percent: (widthFt / SHEET_WIDTH_FT) * 100,
      }))
      .sort((a, b) => b.passCount - a.passCount);

    const escapeXml = (value: string) =>
      value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const zoneRects = zones
      .map((zone, index) => {
        const leftPx = sheetX + (zone.startFt / SHEET_WIDTH_FT) * sheetWidthPx;
        const widthPx =
          ((zone.endFt - zone.startFt) / SHEET_WIDTH_FT) * sheetWidthPx;
        return `<rect key="${index}" x="${leftPx.toFixed(
          2
        )}" y="${sheetY.toFixed(2)}" width="${widthPx.toFixed(
          2
        )}" height="${sheetHeightPx.toFixed(2)}" fill="${getHeatmapColor(
          zone.passCount
        )}" opacity="0.85" />`;
      })
      .join("");

    const summaryText = summaryRows.length
      ? summaryRows
          .map((row, index) => {
            const lineY = summaryY + 70 + index * summaryLineHeight;
            return `<text x="${summaryX}" y="${lineY}" font-size="16" fill="#cfe0f2">${
              row.passCount
            }x overlap: ${row.widthFt.toFixed(2)} ft (${row.percent.toFixed(
              1
            )}%)</text>`;
          })
          .join("")
      : `<text x="${summaryX}" y="${
          summaryY + 70
        }" font-size="16" fill="#cfe0f2">No coverage zones yet</text>`;

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${SNAPSHOT_WIDTH_PX}" height="${SNAPSHOT_HEIGHT_PX}" viewBox="0 0 ${SNAPSHOT_WIDTH_PX} ${SNAPSHOT_HEIGHT_PX}">
        <defs>
          <linearGradient id="ice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#e8f4f8" />
            <stop offset="100%" stop-color="#ddeef5" />
          </linearGradient>
        </defs>
        <rect width="${SNAPSHOT_WIDTH_PX}" height="${SNAPSHOT_HEIGHT_PX}" fill="#0b1621" />
        <rect x="${sheetX}" y="${sheetY}" width="${sheetWidthPx}" height="${sheetHeightPx}" rx="8" fill="url(#ice)" stroke="#2a4a5e" stroke-width="4" />
        ${zoneRects}
        <line x1="${sheetX + sheetWidthPx / 2}" y1="${sheetY}" x2="${
      sheetX + sheetWidthPx / 2
    }" y2="${
      sheetY + sheetHeightPx
    }" stroke="#9bb2c7" stroke-width="2" opacity="0.6" />
        <text x="${summaryX}" y="${summaryY}" font-size="22" fill="#f0f6ff" font-weight="600">Overlap Summary</text>
        <text x="${summaryX}" y="${
      summaryY + 28
    }" font-size="14" fill="#92a8be">${escapeXml(
      `Visible length: ${SHEET_VISIBLE_LENGTH_FT} ft`
    )}</text>
        ${summaryText}
      </svg>
    `;

    return svg.trim();
  };

  const handleDownloadSnapshot = () => {
    const svg = buildSnapshotSvg();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = SNAPSHOT_WIDTH_PX;
      canvas.height = SNAPSHOT_HEIGHT_PX;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#0b1621";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = "curling-scrape-snapshot.png";
      link.click();
    };
    image.src = url;
  };

  const legendValues = [1, 3, 5, 8, 12, 16];

  return (
    <div className="pattern-selector">
      <h2>Heat Map Builder</h2>
      <p className="selector-description">
        Build your scrape sequence ({scrapeList.length}/{maxListSize}) to
        visualize coverage on the heat map.
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
                {value}+ {value === 1 ? "pass" : "passes"}
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
          <div className="empty-list">
            Add patterns below to build your sequence
          </div>
        ) : (
          <div className="scrape-list">
            {scrapeList.map((entry, index) => {
              const info = PATTERN_INFO[entry.patternKey];
              const pattern = PATTERNS[entry.patternKey];
              const angleDeg = entry.angleOn ? ANGLED_BLADE_DEG : 0;
              const effectiveWidth = getEffectiveBladeWidth(
                SCRAPER_WIDTH_FT,
                angleDeg
              );
              const passCount = passCounts[index] ?? 0;
              const configLocked = activePass?.entryIndex === index;
              return (
                <div
                  key={`${entry.patternKey}-${index}`}
                  className="scrape-list-item"
                >
                  <span className="item-number">{index + 1}</span>
                  <span
                    className="item-color"
                    style={{
                      backgroundColor: pattern?.color.replace("0.25", "0.7"),
                    }}
                  />
                  <span className="item-label">
                    {info?.shortLabel || entry.patternKey}
                  </span>
                  <div className="pattern-options">
                    <button
                      className={`option-pill ${entry.angleOn ? "active" : ""}`}
                      disabled={configLocked}
                      onClick={() => onUpdateAngle(index, !entry.angleOn)}
                    >
                      {formatAngleLabel(entry.angleOn)}
                    </button>
                    <button
                      className={`option-pill ${entry.inside ? "active" : ""}`}
                      disabled={configLocked}
                      onClick={() => onUpdateInside(index, !entry.inside)}
                    >
                      {formatInsideLabel(entry.inside)}
                    </button>
                    <span className="angle-meta">
                      Blade {effectiveWidth.toFixed(2)} ft
                    </span>
                  </div>
                  {passCount > 0 && (
                    <div className="pass-buttons">
                      {Array.from({ length: passCount }, (_, passIndex) => {
                        const isActive =
                          activePass?.entryIndex === index &&
                          activePass?.passIndex === passIndex + 1;
                        return (
                          <button
                            key={`pass-${index}-${passIndex}`}
                            className={`pass-btn ${isActive ? "active" : ""}`}
                            onClick={() => onSelectPass(index, passIndex + 1)}
                            title={`Highlight pass ${passIndex + 1}`}
                          >
                            {passIndex + 1}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <button
                    className="remove-btn"
                    onClick={() => onRemovePattern(index)}
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Pattern Buttons */}
      <div className="add-pattern-section">
        <h3>Add Pattern</h3>
        <div className="pattern-buttons add-mode">
          {addPatternKeys.map((patternKey) => {
            const info = PATTERN_INFO[patternKey];
            const pattern = PATTERNS[patternKey];
            const options = addOptions[patternKey] ?? {
              angleOn: false,
              inside: false,
            };

            return (
              <button
                key={patternKey}
                className="add-pattern-btn"
                onClick={() => handleAddClick(patternKey)}
                disabled={!canAddMore}
              >
                <span
                  className="btn-color"
                  style={{
                    backgroundColor: pattern.color.replace("0.25", "0.7"),
                  }}
                />
                <div className="btn-text">
                  <span className="btn-label">{info?.label}</span>
                  <span className="btn-description">{info?.description}</span>
                </div>
                <div className="add-option-badges">
                  <span className="add-angle-badge">
                    {options.angleOn
                      ? `Angled ${ANGLED_BLADE_DEG}°`
                      : "Straight"}
                  </span>
                  <span className="add-angle-badge">
                    {options.inside ? '6" inside' : '3" edge'}
                  </span>
                </div>
                <span className="add-icon">+</span>
              </button>
            );
          })}
        </div>
        {!canAddMore && (
          <p className="add-hint">
            Maximum of {maxListSize} patterns reached. Remove a pass above to
            add another.
          </p>
        )}
      </div>

      {/* Share Section */}
      <div className="share-section">
        <button
          className={`copy-link-button ${copied ? "copied" : ""}`}
          onClick={handleCopyLink}
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
        <button
          className="snapshot-button"
          onClick={handleDownloadSnapshot}
          disabled={scrapeList.length === 0}
        >
          Download Snapshot
        </button>
        <p className="share-hint">Share your scrape pattern via URL</p>
      </div>
    </div>
  );
}
