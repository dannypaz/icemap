"use client";

import { useState } from "react";
import "./PatternOverlay.css";
import {
  CENTER_FT,
  EDGE_INSIDE_FT,
  HOLE_1_FT,
  HOLE_2_FT,
  HOLE_3_FT,
  HOLE_4_FT,
  INSIDE_OFFSET_FT,
  ONE_HALF_HOLE_FT,
  TWO_HALF_HOLE_FT,
  SCRAPER_WIDTH_FT,
  SHEET_WIDTH_FT,
} from "../lib/calibrations";

interface Lane {
  startFt: number;
  widthFt: number;
  direction: "down" | "up";
  label?: string; // Optional custom label (e.g., "Sideline")
  angleOn?: boolean;
  countsAsPass?: boolean;
}

export interface HighlightGroup {
  id: string;
  label: string;
  laneIndexes: number[];
}

interface PatternConfig {
  color: string;
  borderColor: string;
  hoverColor: string;
  lanes: Lane[];
  highlightGroups?: HighlightGroup[];
}

// Lane positions ordered by pass sequence: middle out, alternating down/up
const PATTERNS: Record<string, PatternConfig> = {
  "3-pass (sidelines)": {
    // Straight up the middle + two 6" inside passes, plus half-blade sideline holds
    color: "rgba(80, 200, 140, 0.25)",
    borderColor: "rgba(80, 200, 140, 0.6)",
    hoverColor: "rgba(80, 200, 140, 0.45)",
    lanes: [
      {
        startFt: CENTER_FT - SCRAPER_WIDTH_FT / 2,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "down",
        angleOn: false,
        countsAsPass: true,
      }, // Pass 1: Center straight - DOWN
      {
        startFt: INSIDE_OFFSET_FT,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "up",
        angleOn: false,
        countsAsPass: true,
      }, // Pass 2: Left lane, 6" inside sideline - UP
      {
        startFt: SHEET_WIDTH_FT - SCRAPER_WIDTH_FT - INSIDE_OFFSET_FT,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "up",
        angleOn: false,
        countsAsPass: true,
      }, // Pass 3: Right lane, 6" inside sideline - UP
      {
        startFt: 0,
        widthFt: SCRAPER_WIDTH_FT / 2,
        direction: "down",
        angleOn: false,
        countsAsPass: false,
        label: "Left sideline hold",
      }, // Coverage: Left sideline half blade
      {
        startFt: SHEET_WIDTH_FT - SCRAPER_WIDTH_FT / 2,
        widthFt: SCRAPER_WIDTH_FT / 2,
        direction: "down",
        angleOn: false,
        countsAsPass: false,
        label: "Right sideline hold",
      }, // Coverage: Right sideline half blade
    ],
    highlightGroups: [
      {
        id: "sideline",
        label: "Sideline",
        laneIndexes: [3, 4],
      },
    ],
  },
  "4-pass (1.5-hole)": {
    // First two passes down the middle with 1.5-hole overlap, then 3" inside edges
    color: "rgba(255, 150, 0, 0.25)",
    borderColor: "rgba(255, 150, 0, 0.6)",
    hoverColor: "rgba(255, 150, 0, 0.45)",
    lanes: [
      {
        startFt: CENTER_FT + ONE_HALF_HOLE_FT / 2 - SCRAPER_WIDTH_FT,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "down",
      }, // Pass 1: Left middle - DOWN
      {
        startFt: CENTER_FT - ONE_HALF_HOLE_FT / 2,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "down",
      }, // Pass 2: Right middle - DOWN
      {
        startFt: EDGE_INSIDE_FT,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "up",
      }, // Pass 3: Left inside edge - UP
      {
        startFt: SHEET_WIDTH_FT - SCRAPER_WIDTH_FT - EDGE_INSIDE_FT,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "up",
      }, // Pass 4: Right inside edge - UP
    ],
  },
  "4-pass (2.5-hole)": {
    // First two passes down the middle with 2.5-hole overlap, then 3" inside edges
    color: "rgba(240, 180, 90, 0.25)",
    borderColor: "rgba(240, 180, 90, 0.6)",
    hoverColor: "rgba(240, 180, 90, 0.45)",
    lanes: [
      {
        startFt: CENTER_FT + TWO_HALF_HOLE_FT / 2 - SCRAPER_WIDTH_FT,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "down",
      }, // Pass 1: Left middle - DOWN
      {
        startFt: CENTER_FT - TWO_HALF_HOLE_FT / 2,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "down",
      }, // Pass 2: Right middle - DOWN
      {
        startFt: EDGE_INSIDE_FT,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "up",
      }, // Pass 3: Left inside edge - UP
      {
        startFt: SHEET_WIDTH_FT - SCRAPER_WIDTH_FT - EDGE_INSIDE_FT,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "up",
      }, // Pass 4: Right inside edge - UP
    ],
  },
  "5-pass (2.5-hole)": {
    // Center straight, then two angled middle passes, then 6" inside edges
    color: "rgba(120, 170, 255, 0.25)",
    borderColor: "rgba(120, 170, 255, 0.6)",
    hoverColor: "rgba(120, 170, 255, 0.45)",
    lanes: [
      {
        startFt: CENTER_FT - SCRAPER_WIDTH_FT / 2,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "down",
        angleOn: false,
      }, // Pass 1: Center straight - DOWN
      {
        startFt: CENTER_FT + TWO_HALF_HOLE_FT - SCRAPER_WIDTH_FT,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "up",
        angleOn: true,
      }, // Pass 2: Left middle - UP
      {
        startFt: CENTER_FT - TWO_HALF_HOLE_FT,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "down",
        angleOn: true,
      }, // Pass 3: Right middle - DOWN
      {
        startFt: INSIDE_OFFSET_FT,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "up",
        angleOn: true,
      }, // Pass 4: Left inside edge - UP
      {
        startFt: SHEET_WIDTH_FT - SCRAPER_WIDTH_FT - INSIDE_OFFSET_FT,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "down",
        angleOn: true,
      }, // Pass 5: Right inside edge - DOWN
    ],
  },
  "5-pass (1.5-hole)": {
    // Center straight, then two angled middle passes, then 6" inside edges
    color: "rgba(110, 200, 255, 0.25)",
    borderColor: "rgba(110, 200, 255, 0.6)",
    hoverColor: "rgba(110, 200, 255, 0.45)",
    lanes: [
      {
        startFt: CENTER_FT - SCRAPER_WIDTH_FT / 2,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "down",
        angleOn: false,
      }, // Pass 1: Center straight - DOWN
      {
        startFt: CENTER_FT + ONE_HALF_HOLE_FT - SCRAPER_WIDTH_FT,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "up",
        angleOn: true,
      }, // Pass 2: Left middle - UP
      {
        startFt: CENTER_FT - ONE_HALF_HOLE_FT,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "down",
        angleOn: true,
      }, // Pass 3: Right middle - DOWN
      {
        startFt: INSIDE_OFFSET_FT,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "up",
        angleOn: true,
      }, // Pass 4: Left inside edge - UP
      {
        startFt: SHEET_WIDTH_FT - SCRAPER_WIDTH_FT - INSIDE_OFFSET_FT,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "down",
        angleOn: true,
      }, // Pass 5: Right inside edge - DOWN
    ],
  },
  "6-pass (4/2/0)": {
    // 1-2 at 4-hole, 3-4 at 2-hole, 5-6 on side lines
    color: "rgba(180, 120, 255, 0.25)",
    borderColor: "rgba(180, 120, 255, 0.6)",
    hoverColor: "rgba(180, 120, 255, 0.45)",
    lanes: [
      {
        startFt: CENTER_FT + HOLE_4_FT - SCRAPER_WIDTH_FT,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "down",
        angleOn: true,
      }, // Pass 1: Left 4-hole - DOWN
      {
        startFt: CENTER_FT - HOLE_4_FT,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "up",
        angleOn: true,
      }, // Pass 2: Right 4-hole - UP
      {
        startFt: CENTER_FT + HOLE_2_FT - SCRAPER_WIDTH_FT,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "down",
        angleOn: true,
      }, // Pass 3: Left 2-hole - DOWN
      {
        startFt: CENTER_FT - HOLE_2_FT,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "up",
        angleOn: true,
      }, // Pass 4: Right 2-hole - UP
      {
        startFt: 0,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "down",
        angleOn: true,
      }, // Pass 5: Left sideline - DOWN
      {
        startFt: SHEET_WIDTH_FT - SCRAPER_WIDTH_FT,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "up",
        angleOn: true,
      }, // Pass 6: Right sideline - UP
    ],
  },
  "6-pass (3/1/0)": {
    // 1-2 at 3-hole, 3-4 at 1-hole, 5-6 on side lines
    color: "rgba(100, 200, 240, 0.25)",
    borderColor: "rgba(100, 200, 240, 0.6)",
    hoverColor: "rgba(100, 200, 240, 0.45)",
    lanes: [
      {
        startFt: CENTER_FT + HOLE_3_FT - SCRAPER_WIDTH_FT,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "down",
        angleOn: true,
      }, // Pass 1: Left 3-hole - DOWN
      {
        startFt: CENTER_FT - HOLE_3_FT,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "up",
        angleOn: true,
      }, // Pass 2: Right 3-hole - UP
      {
        startFt: CENTER_FT + HOLE_1_FT - SCRAPER_WIDTH_FT,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "down",
        angleOn: true,
      }, // Pass 3: Left 1-hole - DOWN
      {
        startFt: CENTER_FT - HOLE_1_FT,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "up",
        angleOn: true,
      }, // Pass 4: Right 1-hole - UP
      {
        startFt: 0,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "down",
        angleOn: true,
      }, // Pass 5: Left sideline - DOWN
      {
        startFt: SHEET_WIDTH_FT - SCRAPER_WIDTH_FT,
        widthFt: SCRAPER_WIDTH_FT,
        direction: "up",
        angleOn: true,
      }, // Pass 6: Right sideline - UP
    ],
  },
};

const DEG_TO_RAD = Math.PI / 180;

export function getEffectiveBladeWidth(widthFt: number, angleDeg: number): number {
  const angle = Math.abs(angleDeg) * DEG_TO_RAD;
  return widthFt * Math.cos(angle);
}

export function getPatternLanes(
  patternKey: string,
  angleDeg = 0,
  insideOffsetFt = 0,
): Lane[] {
  const pattern = PATTERNS[patternKey];
  if (!pattern) return [];

  return pattern.lanes.map((lane) => {
    const laneAngle = lane.angleOn === false ? 0 : angleDeg;
    const effectiveWidth = getEffectiveBladeWidth(lane.widthFt, laneAngle);
    const startShift = (lane.widthFt - effectiveWidth) / 2;
    const startFt = lane.startFt + startShift;
    const endFt = startFt + effectiveWidth;
    const insideStart = insideOffsetFt > 0 ? insideOffsetFt : 0;
    const insideEnd = insideOffsetFt > 0 ? SHEET_WIDTH_FT - insideOffsetFt : SHEET_WIDTH_FT;
    const clampedStart = Math.max(startFt, insideStart);
    const clampedEnd = Math.min(endFt, insideEnd);
    return {
      ...lane,
      startFt: clampedStart,
      widthFt: Math.max(0, clampedEnd - clampedStart),
    };
  });
}

export function getPassLanes(
  patternKey: string,
  angleDeg = 0,
  insideOffsetFt = 0,
): Lane[] {
  return getPatternLanes(patternKey, angleDeg, insideOffsetFt).filter(
    (lane) => lane.countsAsPass !== false,
  );
}

export function getPatternHighlightGroups(patternKey: string): HighlightGroup[] {
  const pattern = PATTERNS[patternKey];
  return pattern?.highlightGroups ?? [];
}

export function getHighlightGroupById(
  patternKey: string,
  groupId: string,
): HighlightGroup | undefined {
  return getPatternHighlightGroups(patternKey).find((group) => group.id === groupId);
}

// Short ID mapping for URL encoding
const PATTERN_ID_MAP: Record<string, string> = {
  "3": "3-pass (sidelines)",
  "4": "4-pass (1.5-hole)",
  "4b": "4-pass (2.5-hole)",
  "5": "5-pass (2.5-hole)",
  "5b": "5-pass (1.5-hole)",
  "6": "6-pass (4/2/0)",
  "6b": "6-pass (3/1/0)",
};

const PATTERN_KEY_TO_ID: Record<string, string> = {
  "3-pass (sidelines)": "3",
  "4-pass (1.5-hole)": "4",
  "4-pass (2.5-hole)": "4b",
  "5-pass (2.5-hole)": "5",
  "5-pass (1.5-hole)": "5b",
  "6-pass (4/2/0)": "6",
  "6-pass (3/1/0)": "6b",
};

// Helper functions for ID conversion
export function patternIdToKey(id: string): string | undefined {
  return PATTERN_ID_MAP[id];
}

export function patternKeyToId(key: string): string | undefined {
  return PATTERN_KEY_TO_ID[key];
}

export function getPatternKeys(): string[] {
  return Object.keys(PATTERNS);
}

// Convert feet to percentage of sheet width
function ftToPercent(ft: number): number {
  return (ft / SHEET_WIDTH_FT) * 100;
}

interface PatternOverlayProps {
  patternId: string;
  showLabels?: boolean;
  isPreview?: boolean;
}

export function PatternOverlay({
  patternId,
  showLabels = true,
  isPreview = false,
}: PatternOverlayProps) {
  const [hoveredLane, setHoveredLane] = useState<number | null>(null);
  const pattern = PATTERNS[patternId];
  if (!pattern) return null;
  const lanes = getPatternLanes(patternId, 0, 0);
  let passCounter = 0;

  return (
    <>
      {lanes.map((lane, index) => {
        const isDown = lane.direction === "down";
        const isHovered = hoveredLane === index;
        const isPassLane = lane.countsAsPass !== false;
        const displayLabel =
          lane.label ||
          (isPassLane ? `Pass ${++passCounter}` : `Coverage ${index + 1}`);

        return (
          <div
            key={`${patternId}-${index}`}
            className={`scrape-lane ${
              isDown ? "direction-down" : "direction-up"
            } ${isHovered ? "highlighted" : ""} ${isPreview ? "preview" : ""}`}
            style={{
              left: `${ftToPercent(lane.startFt)}%`,
              width: `${ftToPercent(lane.widthFt)}%`,
              backgroundColor: isHovered ? pattern.hoverColor : pattern.color,
              borderLeft: `2px solid ${pattern.borderColor}`,
              borderRight: `2px solid ${pattern.borderColor}`,
            }}
          >
            {showLabels && (
              <div
                className="lane-label"
                onMouseEnter={() => setHoveredLane(index)}
                onMouseLeave={() => setHoveredLane(null)}
              >
                <span className="pass-number">
                  {displayLabel}
                </span>
                <div
                  className={`direction-arrow ${
                    isDown ? "arrow-down" : "arrow-up"
                  }`}
                >
                  {isDown ? "↓" : "↑"}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

export { PATTERNS };
