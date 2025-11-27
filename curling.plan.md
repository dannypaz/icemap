# Curling Scrape Pattern Visualizer

## Overview

Create a simple React application where users can select scrape patterns (2-pass, 3-pass, 4-pass, 5-pass) via checkboxes and see the vertical lane patterns overlaid on a curling sheet with transparency to visualize overlaps.

## Technical Architecture

**Framework**: React with Vite

**Styling**: CSS (flexbox for layout, absolute positioning for overlays)

**Sheet Dimensions**: 14 feet wide × ~150 feet long (scaled proportionally)

**Scraper Width**: 5 feet per vertical lane

## Key Components

### 1. CurlingSheet Component

- Visual representation of ice surface with proper aspect ratio
- Container for pattern overlays
- Background styling to resemble ice

### 2. PatternSelector Component

- Checkboxes for each pattern type (2-pass, 3-pass, 4-pass, 5-pass)
- State management for selected patterns
- Each pattern assigned a distinct color

### 3. PatternOverlay Component

- Renders vertical lanes (5 feet wide each) based on selected patterns
- Uses semi-transparent colors (e.g., rgba with 0.3-0.4 alpha)
- Overlapping areas will naturally show darker/more saturated colors

## Scrape Pattern Logic

Each pattern consists of vertical lanes across the sheet:

- **2-pass**: 2 vertical lanes positioned strategically
- **3-pass**: Center lane + one lane on each side (classic pattern)
- **4-pass**: Center + 3 additional lanes (overlapping coverage)
- **5-pass**: Even more comprehensive coverage with overlaps

Lane positioning will be calculated to show realistic icemaker patterns where lanes overlap at edges (5ft blade × multiple passes > 14ft width).

## Implementation Steps

1. **Initialize Vite + React project** with TypeScript
2. **Create CurlingSheet component** with scaled CSS dimensions
3. **Build PatternSelector** with checkboxes and state management
4. **Implement pattern calculation logic** for lane positions
5. **Render PatternOverlay** components with transparency
6. **Style and polish** the UI for clarity

## File Structure

```
/src
  /components
    CurlingSheet.tsx
    PatternSelector.tsx
    PatternOverlay.tsx
  App.tsx
  App.css
  main.tsx
package.json
index.html
```

## Color Scheme

- 2-pass: Blue (rgba(0, 100, 255, 0.35))
- 3-pass: Green (rgba(0, 200, 100, 0.35))
- 4-pass: Orange (rgba(255, 150, 0, 0.35))
- 5-pass: Purple (rgba(150, 0, 255, 0.35))

Overlapping areas will blend colors showing density of coverage.
