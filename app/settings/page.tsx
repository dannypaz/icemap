import Link from "next/link";
import {
  CENTER_FT,
  EDGE_INSIDE_FT,
  HOLE_1_IN,
  HOLE_2_IN,
  HOLE_3_IN,
  HOLE_4_IN,
  ONE_HALF_HOLE_FT,
  TWO_HALF_HOLE_FT,
  ANGLED_BLADE_DEG,
  PASS_ANGLE_DEG,
  SCRAPER_WIDTH_FT,
  SHEET_WIDTH_FT,
  SIDELINE_WIDTH_FT,
  INSIDE_OFFSET_FT,
} from "../lib/calibrations";

export default function SettingsPage() {
  return (
    <div className="app settings-page">
      <header className="app-header settings-header">
        <div className="settings-header-content">
          <div>
            <h1>Scraper Calibration Settings</h1>
            <p>Reference values used to compute blade size, overlaps, and lanes.</p>
          </div>
          <Link className="settings-back" href="/">
            Back to visualizer
          </Link>
        </div>
      </header>

      <main className="app-main settings-main">
        <section className="settings-card">
          <h2>Blade + Sheet</h2>
          <div className="settings-grid">
            <div>
              <span className="settings-label">Sheet width</span>
              <span className="settings-value">{SHEET_WIDTH_FT} ft</span>
            </div>
            <div>
              <span className="settings-label">Scraper blade width</span>
              <span className="settings-value">{SCRAPER_WIDTH_FT} ft</span>
            </div>
            <div>
              <span className="settings-label">Sheet centerline</span>
              <span className="settings-value">{CENTER_FT} ft</span>
            </div>
            <div>
              <span className="settings-label">Sideline width</span>
              <span className="settings-value">{SIDELINE_WIDTH_FT} ft</span>
            </div>
          </div>
        </section>

        <section className="settings-card">
          <h2>Hole Calibration</h2>
          <div className="settings-grid">
            <div>
              <span className="settings-label">Hole 1</span>
              <span className="settings-value">{HOLE_1_IN} in</span>
            </div>
            <div>
              <span className="settings-label">Hole 2</span>
              <span className="settings-value">{HOLE_2_IN} in</span>
            </div>
            <div>
              <span className="settings-label">Hole 3</span>
              <span className="settings-value">{HOLE_3_IN} in</span>
            </div>
            <div>
              <span className="settings-label">Hole 4 (right center)</span>
              <span className="settings-value">{HOLE_4_IN} in</span>
            </div>
            <div>
              <span className="settings-label">1.5-hole overlap</span>
              <span className="settings-value">
                {ONE_HALF_HOLE_FT.toFixed(3)} ft ({((HOLE_1_IN + HOLE_2_IN) / 2).toFixed(2)} in)
              </span>
            </div>
            <div>
              <span className="settings-label">2.5-hole overlap</span>
              <span className="settings-value">
                {TWO_HALF_HOLE_FT.toFixed(3)} ft ({((HOLE_2_IN + HOLE_3_IN) / 2).toFixed(2)} in)
              </span>
            </div>
            <div>
              <span className="settings-label">Edge inset for 4-pass</span>
              <span className="settings-value">
                {EDGE_INSIDE_FT.toFixed(3)} ft (3 in)
              </span>
            </div>
          </div>
        </section>

        <section className="settings-card">
          <h2>Pass Geometry</h2>
          <div className="settings-grid">
            <div>
              <span className="settings-label">Blade angle</span>
              <span className="settings-value">{PASS_ANGLE_DEG}°</span>
            </div>
            <div>
              <span className="settings-label">Modeled orientation</span>
              <span className="settings-value">Parallel to center line</span>
            </div>
            <div>
              <span className="settings-label">Angled blade option</span>
              <span className="settings-value">{ANGLED_BLADE_DEG}°</span>
            </div>
            <div>
              <span className="settings-label">Inside offset option</span>
              <span className="settings-value">{INSIDE_OFFSET_FT} ft (6 in)</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
