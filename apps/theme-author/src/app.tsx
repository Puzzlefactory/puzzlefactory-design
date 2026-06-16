import type { ReactNode } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router";

const navItems = [
  { to: "/overview", label: "Overview" },
  { to: "/input", label: "Theme Input" },
  { to: "/preview", label: "Preview" },
  { to: "/artifacts", label: "Artifacts" },
  { to: "/diagnostics", label: "Diagnostics" },
] as const;

const overviewSteps = [
  {
    label: "Input",
    title: "Normalize Source",
    text: "Collect seed colors, policy presets, theme metadata, and custom role intent before generation.",
  },
  {
    label: "Preview",
    title: "Review Themes",
    text: "Compare light, dark, high-contrast, and custom role output in product-shaped surfaces.",
  },
  {
    label: "Artifacts",
    title: "Prepare Delivery",
    text: "Inspect the generated CSS files and manifest that downstream apps will publish or load.",
  },
] as const;

const inputSections = [
  "Identity and tenant metadata",
  "Neutral and surface inputs",
  "Primary and status seeds",
  "Custom color roles",
  "Preset policy choices",
] as const;

const previewSections = [
  "Theme frame",
  "Surface regions",
  "Primary actions",
  "Status and custom roles",
  "Component examples",
] as const;

const artifactSections = [
  "primitives.css",
  "theme-light.css",
  "theme-dark.css",
  "theme-high-contrast.css",
  "theme-high-contrast-dark.css",
  "manifest.json",
] as const;

const diagnosticSections = [
  "Readiness summary",
  "Required contrast pairs",
  "Recommended contrast pairs",
  "Custom role checks",
  "Export warnings",
] as const;

export function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Theme Author navigation">
        <div className="brand-block">
          <span className="eyebrow">PuzzleFactory</span>
          <h1>Theme Author</h1>
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

      <main className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/input" element={<ThemeInputPage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="/artifacts" element={<ArtifactsPage />} />
          <Route path="/diagnostics" element={<DiagnosticsPage />} />
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function OverviewPage() {
  return (
    <PageFrame
      eyebrow="Theme workflow"
      title="Author theme artifacts"
      summary="A focused workspace for shaping normalized theme input into reviewable CSS artifacts."
    >
      <section className="workflow-grid" aria-label="Theme authoring workflow">
        {overviewSteps.map((step) => (
          <article className="workflow-step" key={step.label}>
            <span>{step.label}</span>
            <h2>{step.title}</h2>
            <p>{step.text}</p>
          </article>
        ))}
      </section>
      <section className="status-band" aria-label="Current scaffold status">
        <div>
          <span className="eyebrow">Current phase</span>
          <h2>Shell only</h2>
        </div>
        <p>
          This app is ready for the next authoring slices: real input editing,
          visual preview, diagnostics, and artifact export.
        </p>
      </section>
    </PageFrame>
  );
}

function ThemeInputPage() {
  return (
    <PageFrame
      eyebrow="Input"
      title="Theme Input"
      summary="Designer-facing controls will collect the canonical normalized theme settings here."
    >
      <ChecklistPanel title="Planned input groups" items={inputSections} />
    </PageFrame>
  );
}

function PreviewPage() {
  return (
    <PageFrame
      eyebrow="Preview"
      title="Theme Preview"
      summary="Generated themes will be reviewed in product-shaped light, dark, and high-contrast boundaries."
    >
      <ThemePreviewGrid />
      <ChecklistPanel title="Preview targets" items={previewSections} />
    </PageFrame>
  );
}

function ArtifactsPage() {
  return (
    <PageFrame
      eyebrow="Delivery"
      title="Artifacts"
      summary="Generated CSS files and manifest output will be inspected before handoff or publishing."
    >
      <ChecklistPanel title="Expected artifact set" items={artifactSections} />
    </PageFrame>
  );
}

function DiagnosticsPage() {
  return (
    <PageFrame
      eyebrow="Review"
      title="Diagnostics"
      summary="Theme readiness, contrast diagnostics, and export warnings will be summarized here."
    >
      <ChecklistPanel title="Diagnostic groups" items={diagnosticSections} />
    </PageFrame>
  );
}

function PageFrame({
  eyebrow,
  title,
  summary,
  children,
}: {
  readonly eyebrow: string;
  readonly title: string;
  readonly summary: string;
  readonly children: ReactNode;
}) {
  return (
    <div className="page-frame">
      <header className="page-header">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{summary}</p>
      </header>
      <div className="page-content">{children}</div>
    </div>
  );
}

function ChecklistPanel({
  title,
  items,
}: {
  readonly title: string;
  readonly items: readonly string[];
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{title}</h2>
        <span>{items.length} items</span>
      </div>
      <div className="placeholder-list">
        {items.map((item) => (
          <div className="placeholder-row" key={item}>
            <span aria-hidden="true" />
            <p>{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ThemePreviewGrid() {
  return (
    <section className="theme-preview-grid" aria-label="Theme boundary placeholders">
      <article className="theme-preview theme-preview-light">
        <span>Light</span>
        <h2>Surface Review</h2>
        <p>Light theme preview boundary.</p>
        <button type="button">Action</button>
      </article>
      <article className="theme-preview theme-preview-dark">
        <span>Dark</span>
        <h2>Surface Review</h2>
        <p>Dark theme preview boundary.</p>
        <button type="button">Action</button>
      </article>
      <article className="theme-preview theme-preview-contrast">
        <span>High Contrast</span>
        <h2>Surface Review</h2>
        <p>High-contrast preview boundary.</p>
        <button type="button">Action</button>
      </article>
    </section>
  );
}
