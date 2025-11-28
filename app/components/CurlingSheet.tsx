import { ReactNode } from 'react'
import './CurlingSheet.css'

interface CurlingSheetProps {
  children?: ReactNode
}

export function CurlingSheet({ children }: CurlingSheetProps) {
  return (
    <div className="curling-sheet-container">
      <div className="curling-sheet">
        {/* Ice markings */}
        <div className="sheet-markings">
          {/* Back line - at top of 12ft ring */}
          <div className="back-line"></div>

          {/* House (target) */}
          <div className="house">
            <div className="ring ring-12ft"></div>
            <div className="ring ring-8ft"></div>
            <div className="ring ring-4ft"></div>
            <div className="button"></div>
          </div>

          {/* Tee line - through center of button */}
          <div className="tee-line"></div>

          {/* Center line */}
          <div className="center-line"></div>

          {/* Hog line - thick red line below house */}
          <div className="hog-line"></div>

          {/* Hack - footholds at top of sheet */}
          <div className="hack hack-left"></div>
          <div className="hack hack-right"></div>
        </div>

        {/* Pattern overlays */}
        <div className="pattern-layer">
          {children}
        </div>

        {/* Width markers */}
        <div className="width-markers">
          <span className="marker marker-left">0ft</span>
          <span className="marker marker-center">7ft</span>
          <span className="marker marker-right">14ft</span>
        </div>
      </div>
    </div>
  )
}
