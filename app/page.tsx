import { CurlingVisualizer } from "./components/CurlingVisualizer";

export default function Home() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Curling Scrape Pattern Visualizer</h1>
        <p>Visualize ice maintenance scraping patterns and their overlaps</p>
      </header>

      <main className="app-main">
        <CurlingVisualizer />
      </main>

      <footer className="app-footer">
        <p>Our examples use a 5ft blade across a 14ft sheet.</p>
      </footer>
    </div>
  );
}
