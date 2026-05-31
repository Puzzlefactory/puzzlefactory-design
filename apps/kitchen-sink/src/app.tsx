import type { ReactNode } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router";

const navItems = [
  { to: "/overview", label: "Overview" },
  { to: "/controls", label: "Controls" },
  { to: "/primitives", label: "Primitives" },
  { to: "/semantic", label: "Semantic" },
  { to: "/themes", label: "Themes" },
  { to: "/assertions", label: "Assertions" },
];

const rampRows = [
  ["palette-a", "12 light steps", "12 dark steps", "Awaiting engine output"],
  ["neutral", "12 light steps", "12 dark steps", "Seed-tinted low chroma"],
  ["status", "danger, warning", "success, info", "Anchored hues"],
];

const themeVariants = [
  "light",
  "dark",
  "high-contrast",
  "high-contrast-dark",
];

const semanticRows = [
  ["surface-base", "Page background", "neutral"],
  ["text-primary", "Primary reading text", "neutral"],
  ["action-primary", "Primary action fill", "palette-a"],
  ["focus-ring", "Keyboard focus indicator", "palette-a"],
];

const assertionRows = [
  ["Text on surface", "Pending", "Needs APCA"],
  ["Action contrast", "Pending", "Needs APCA"],
  ["Status warning floor", "Pending", "Known amber constraint"],
  ["Polarity checks", "Pending", "Signed Lc required"],
];

export function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Kitchen sink navigation">
        <div className="brand-block">
          <span className="eyebrow">PuzzleFactory</span>
          <h1>Color Engine Kitchen Sink</h1>
        </div>
        <nav className="nav-list">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="main-panel">
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/controls" element={<SeedControls />} />
          <Route path="/primitives" element={<Primitives />} />
          <Route path="/semantic" element={<SemanticPreview />} />
          <Route path="/themes" element={<ThemeVariants />} />
          <Route path="/assertions" element={<Assertions />} />
        </Routes>
      </main>
    </div>
  );
}

function Overview() {
  return (
    <ViewFrame
      title="Verification Shell"
      subtitle="Static surface for wiring the future color engine output."
    >
      <section className="overview-grid" aria-label="Verification areas">
        {navItems.slice(1).map((item) => (
          <NavLink className="area-link" key={item.to} to={item.to}>
            {item.label}
          </NavLink>
        ))}
      </section>
    </ViewFrame>
  );
}

function SeedControls() {
  return (
    <ViewFrame
      title="Seed Controls"
      subtitle="Input surface reserved for seed, harmony, mood, and active theme controls."
    >
      <section className="toolbar-grid" aria-label="Seed controls placeholder">
        <ControlStub label="Seed" value="#7c3aed" />
        <ControlStub label="Harmony" value="Complementary" />
        <ControlStub label="Mood" value="Vibrant" />
        <ControlStub label="Theme" value="Light" />
      </section>
    </ViewFrame>
  );
}

function Primitives() {
  return (
    <ViewFrame
      title="Primitive Ramps"
      subtitle="Palette, neutral, and status slots reserved for generated OKLCH values."
    >
      <DataTable
        columns={["Slot", "Light ramp", "Dark ramp", "Notes"]}
        rows={rampRows}
      />
    </ViewFrame>
  );
}

function SemanticPreview() {
  return (
    <ViewFrame
      title="Semantic Preview"
      subtitle="Role inventory that will map semantic tokens to primitive slots."
    >
      <div className="semantic-layout">
        <DataTable columns={["Role", "Intent", "Primitive family"]} rows={semanticRows} />
        <div className="component-strip" aria-label="Component preview placeholder">
          <button type="button">Primary</button>
          <button type="button" className="secondary-button">
            Secondary
          </button>
          <input aria-label="Example input" placeholder="Field preview" />
        </div>
      </div>
    </ViewFrame>
  );
}

function ThemeVariants() {
  return (
    <ViewFrame
      title="Theme Variants"
      subtitle="Light, dark, and high-contrast render targets for future generated tokens."
    >
      <section className="preview-grid" aria-label="Theme variants">
        {themeVariants.map((variant) => (
          <div className="theme-tile" key={variant}>
            <span>{variant}</span>
            <div className="tile-bars" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
          </div>
        ))}
      </section>
    </ViewFrame>
  );
}

function Assertions() {
  return (
    <ViewFrame
      title="Assertion Report"
      subtitle="Contrast, polarity, and high-contrast checks will appear here."
    >
      <DataTable columns={["Check", "Status", "Dependency"]} rows={assertionRows} />
    </ViewFrame>
  );
}

function ViewFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="view-frame">
      <header className="view-header">
        <span className="eyebrow">Kitchen Sink</span>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </header>
      {children}
    </div>
  );
}

function ControlStub({ label, value }: { label: string; value: string }) {
  return (
    <label className="control-stub">
      <span>{label}</span>
      <input value={value} readOnly />
    </label>
  );
}

function DataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: string[][];
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join(":")}>
              {row.map((cell) => (
                <td key={cell}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
