import {
  COLOR_ENGINE_THEME_PRESET_NAMES,
  COLOR_ENGINE_THEME_PRESETS,
  ColorEngineValidationError,
  SEED_POLICY_NAMES,
  SURFACE_PRESET_NAMES,
  SURFACE_PRESETS,
  TEXT_TREATMENT_STRATEGIES,
  TEXT_TREATMENT_STRATEGY_NAMES,
  createColorEngineCssArtifacts,
  createColorEngineTheme,
  type ContrastAssertionRole,
  type ColorEngineInput,
  type ColorEngineCssArtifact,
  type ColorEngineCssFileName,
  type ColorEngineOutput,
  type ColorEngineThemePresetInput,
  type ColorEngineThemePresetName,
  type ColorToken,
  type ResolvedContrastAssertion,
  type SeedPolicy,
  type SurfaceTheme,
  type SurfacePresetName,
  type TextTreatmentStrategyName,
} from "@puzzlefactory/color-engine";
import type { CSSProperties, ChangeEvent, ReactNode } from "react";
import { useMemo, useRef, useState } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router";
import {
  INITIAL_AUTHORED_ROLES,
  INITIAL_REGION_MAPPINGS,
  createNormalizedCustomRoles,
  getEngineFieldRoleKey,
  isAuthoringStateModified,
  normalizeRegionMappings,
  validateAuthoredRoleIds,
  type AuthoredCustomRole,
  type AuthoredRegionMapping,
  type RegionId,
  type RegionTreatment,
} from "./authoring-model";
import {
  createRegionDiagnostics,
  resolveRegionLabelForeground,
  type RegionDiagnosticResult,
  type RegionResolvedMapping,
} from "./region-diagnostics";

const navItems = [
  { to: "/overview", label: "Overview" },
  { to: "/input", label: "Theme Input" },
  { to: "/preview", label: "Preview" },
  { to: "/regions", label: "Regions" },
  { to: "/artifacts", label: "Artifacts" },
  { to: "/diagnostics", label: "Diagnostics" },
] as const;

const artifactSections = [
  "primitives.css",
  "theme-light.css",
  "theme-dark.css",
  "theme-high-contrast.css",
  "theme-high-contrast-dark.css",
  "bundle.css",
  "manifest.json",
] as const;

const diagnosticSections = [
  "Readiness",
  "Required pairs",
  "Advisory pairs",
  "Theme coverage",
  "Export guidance",
] as const;

const previewThemes = [
  { key: "light", label: "Light", note: "Default workspace review" },
  { key: "dark", label: "Dark", note: "Low-light workspace review" },
  { key: "high-contrast", label: "High Contrast", note: "Fixed contrast review" },
  {
    key: "high-contrast-dark",
    label: "High Contrast Dark",
    note: "Fixed dark contrast review",
  },
] as const satisfies readonly {
  readonly key: SurfaceTheme;
  readonly label: string;
  readonly note: string;
}[];

const assertionRoleLabels = {
  body: "Body text",
  secondary: "Secondary text",
  muted: "Muted text",
  ui: "UI controls",
  "status-soft": "Soft color roles",
  "status-solid": "Solid color roles",
} as const satisfies Readonly<Record<ContrastAssertionRole, string>>;

const statusFields = [
  { key: "danger", label: "Danger" },
  { key: "warning", label: "Warning" },
  { key: "success", label: "Success" },
  { key: "info", label: "Info" },
] as const;

const regionDefinitions = {
  header: {
    label: "Header",
    description: "Institutional masthead, account controls, and primary navigation chrome.",
  },
  sidebar: {
    label: "Sidebar",
    description: "Persistent navigation context that can be tinted without becoming primary action color.",
  },
  footer: {
    label: "Footer",
    description: "Dense lower-chrome area for links, legal text, and operational metadata.",
  },
} as const satisfies Readonly<Record<RegionId, { readonly label: string; readonly description: string }>>;

const seedPolicyOptions = SEED_POLICY_NAMES.map((name) => ({
  label: toTitleLabel(name),
  value: name,
}));

const surfacePresetOptions = SURFACE_PRESET_NAMES.map((name) => ({
  label: SURFACE_PRESETS[name].label,
  value: name,
}));

const textTreatmentOptions = TEXT_TREATMENT_STRATEGY_NAMES.map((name) => ({
  label: TEXT_TREATMENT_STRATEGIES[name].label,
  value: name,
}));

type EditableThemeInput = ColorEngineThemePresetInput & {
  readonly namespace: string;
};

type EngineState =
  | {
      readonly kind: "ready";
      readonly output: ColorEngineOutput;
    }
  | {
      readonly kind: "error";
      readonly message: string;
      readonly field?: string;
      readonly roleKey?: string;
    };

type InputFieldName = keyof EditableThemeInput;

type ArtifactFileName = ColorEngineCssFileName | "bundle.css" | "manifest.json";

type ArtifactPreviewFile = {
  readonly fileName: ArtifactFileName;
  readonly label: string;
  readonly meta: string;
  readonly content: string;
  readonly byteLength: number;
  readonly contentHash?: string;
};

type RegionMapping = AuthoredRegionMapping & {
  readonly label: string;
  readonly description: string;
};

type RegionStyle = CSSProperties & Readonly<Record<`--region-${string}`, string>>;

const initialPresetName = "evergreen" satisfies ColorEngineThemePresetName;
const initialInput = {
  ...COLOR_ENGINE_THEME_PRESETS[initialPresetName].input,
  namespace: "ds",
} as const satisfies EditableThemeInput;

export function App() {
  const [themeInput, setThemeInput] = useState<EditableThemeInput>(initialInput);
  const [activePresetName, setActivePresetName] =
    useState<ColorEngineThemePresetName>(initialPresetName);
  const [isCustom, setIsCustom] = useState(false);
  const [authoredRoles, setAuthoredRoles] = useState<readonly AuthoredCustomRole[]>(
    INITIAL_AUTHORED_ROLES,
  );
  const [regionMappings, setRegionMappings] = useState<readonly AuthoredRegionMapping[]>(
    INITIAL_REGION_MAPPINGS,
  );
  const nextRoleNumber = useRef(INITIAL_AUTHORED_ROLES.length + 1);

  const engine = useMemo<EngineState>(
    () => createEngineState(themeInput, authoredRoles),
    [authoredRoles, themeInput],
  );

  function applyPreset(presetName: ColorEngineThemePresetName) {
    setActivePresetName(presetName);
    setIsCustom(isAuthoringStateModified(authoredRoles, regionMappings));
    setThemeInput({
      ...COLOR_ENGINE_THEME_PRESETS[presetName].input,
      namespace: themeInput.namespace,
    });
  }

  function updateField<FieldName extends InputFieldName>(
    field: FieldName,
    value: EditableThemeInput[FieldName],
  ) {
    setThemeInput((current) => ({
      ...current,
      [field]: value,
    }));
    setIsCustom(true);
  }

  function updateSharedSurfacePreset(value: SurfacePresetName) {
    setThemeInput((current) => ({
      ...current,
      preset: value,
      lightSurfacePreset: value,
      darkSurfacePreset: value,
    }));
    setIsCustom(true);
  }

  function addRole() {
    const roleNumber = nextRoleNumber.current;
    nextRoleNumber.current += 1;
    setAuthoredRoles((current) => [
      ...current,
      {
        key: `role-${roleNumber}`,
        id: `custom-role-${roleNumber}`,
        lightSeed: "oklch(0.55 0.12 250)",
        darkSeed: "",
        seedPolicy: "balanced",
        enabled: true,
      },
    ]);
    setIsCustom(true);
  }

  function updateRole(roleKey: string, patch: Partial<Omit<AuthoredCustomRole, "key">>) {
    setAuthoredRoles((current) => current.map((role) =>
      role.key === roleKey ? { ...role, ...patch } : role
    ));
    setIsCustom(true);
  }

  function removeRole(roleKey: string) {
    setAuthoredRoles((current) => current.filter((role) => role.key !== roleKey));
    setIsCustom(true);
  }

  function updateRegion(regionId: RegionId, patch: Partial<Omit<AuthoredRegionMapping, "id">>) {
    setRegionMappings((current) => current.map((mapping) =>
      mapping.id === regionId ? { ...mapping, ...patch } : mapping
    ));
    setIsCustom(true);
  }

  const presetLabel = isCustom
    ? `${COLOR_ENGINE_THEME_PRESETS[activePresetName].label} modified`
    : COLOR_ENGINE_THEME_PRESETS[activePresetName].label;

  return (
    <div className="app-shell">
      {engine.kind === "ready" ? <EngineStyles css={engine.output.css} /> : null}
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
          <Route
            path="/overview"
            element={
              <OverviewPage
                engine={engine}
                presetLabel={presetLabel}
                themeInput={themeInput}
              />
            }
          />
          <Route
            path="/input"
            element={
              <ThemeInputPage
                activePresetName={activePresetName}
                engine={engine}
                isCustom={isCustom}
                onApplyPreset={applyPreset}
                authoredRoles={authoredRoles}
                onAddRole={addRole}
                onRemoveRole={removeRole}
                onUpdateRole={updateRole}
                onUpdateField={updateField}
                onUpdateSharedSurfacePreset={updateSharedSurfacePreset}
                themeInput={themeInput}
              />
            }
          />
          <Route path="/preview" element={<PreviewPage engine={engine} />} />
          <Route path="/regions" element={<RegionsPage authoredRoles={authoredRoles} engine={engine} mappings={regionMappings} onUpdateRegion={updateRegion} />} />
          <Route path="/artifacts" element={<ArtifactsPage engine={engine} mappings={regionMappings} roles={authoredRoles} />} />
          <Route path="/diagnostics" element={<DiagnosticsPage engine={engine} mappings={regionMappings} roles={authoredRoles} />} />
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function OverviewPage({
  engine,
  presetLabel,
  themeInput,
}: {
  readonly engine: EngineState;
  readonly presetLabel: string;
  readonly themeInput: EditableThemeInput;
}) {
  return (
    <PageFrame
      eyebrow="Theme workflow"
      title="Author theme artifacts"
      summary="A focused workspace for shaping normalized theme input into reviewable CSS artifacts."
    >
      <section className="summary-grid" aria-label="Theme authoring state">
        <MetricCard label="Preset" value={presetLabel} />
        <MetricCard label="Namespace" value={`--${themeInput.namespace}-*`} />
        <MetricCard
          label="Engine state"
          tone={engine.kind === "ready" ? "good" : "bad"}
          value={engine.kind === "ready" ? "Ready" : "Needs input"}
        />
      </section>

      <section className="status-band" aria-label="Current authoring phase">
        <div>
          <span className="eyebrow">Current phase</span>
          <h2>Review-ready workflow</h2>
        </div>
        <p>
          Theme Author now holds normalized color-engine input and validates it
          against the real generator. Generated preview, artifact inspection, and
          human-readable readiness diagnostics are available from the active input.
        </p>
      </section>
    </PageFrame>
  );
}

function ThemeInputPage({
  activePresetName,
  authoredRoles,
  engine,
  isCustom,
  onAddRole,
  onApplyPreset,
  onRemoveRole,
  onUpdateRole,
  onUpdateField,
  onUpdateSharedSurfacePreset,
  themeInput,
}: {
  readonly activePresetName: ColorEngineThemePresetName;
  readonly authoredRoles: readonly AuthoredCustomRole[];
  readonly engine: EngineState;
  readonly isCustom: boolean;
  readonly onAddRole: () => void;
  readonly onApplyPreset: (presetName: ColorEngineThemePresetName) => void;
  readonly onRemoveRole: (roleKey: string) => void;
  readonly onUpdateRole: (
    roleKey: string,
    patch: Partial<Omit<AuthoredCustomRole, "key">>,
  ) => void;
  readonly onUpdateField: <FieldName extends InputFieldName>(
    field: FieldName,
    value: EditableThemeInput[FieldName],
  ) => void;
  readonly onUpdateSharedSurfacePreset: (value: SurfacePresetName) => void;
  readonly themeInput: EditableThemeInput;
}) {
  return (
    <PageFrame
      eyebrow="Input"
      title="Theme Input"
      summary="Edit the normalized theme source that will eventually produce reviewable CSS artifacts."
    >
      <section className="preset-grid" aria-label="Theme presets">
        {COLOR_ENGINE_THEME_PRESET_NAMES.map((presetName) => {
          const preset = COLOR_ENGINE_THEME_PRESETS[presetName];
          const selected = activePresetName === presetName && !isCustom;

          return (
            <button
              className={selected ? "preset-option preset-option-active" : "preset-option"}
              key={presetName}
              onClick={() => onApplyPreset(presetName)}
              type="button"
            >
              <span>{selected ? "Selected" : "Preset"}</span>
              <strong>{preset.label}</strong>
              <small>{preset.description}</small>
            </button>
          );
        })}
      </section>

      <EngineNotice engine={engine} />

      <section className="editor-grid" aria-label="Normalized theme input fields">
        <FormPanel title="Foundation">
          <TextField
            label="Namespace"
            disabled
            onChange={() => undefined}
            value={themeInput.namespace}
          />
          <TextField
            label="Neutral seed"
            onChange={(value) => onUpdateField("neutralSeed", value)}
            value={themeInput.neutralSeed}
          />
          <TextField
            label="Light surface seed"
            onChange={(value) => onUpdateField("surfaceLightSeed", value)}
            value={themeInput.surfaceLightSeed}
          />
          <TextField
            label="Dark surface seed"
            onChange={(value) => onUpdateField("surfaceDarkSeed", value)}
            value={themeInput.surfaceDarkSeed}
          />
        </FormPanel>

        <FormPanel title="Surface and text">
          <SelectField
            label="Shared surface preset"
            onChange={(value) => onUpdateSharedSurfacePreset(value as SurfacePresetName)}
            options={surfacePresetOptions}
            value={themeInput.preset}
          />
          <SelectField
            label="Light surface preset"
            onChange={(value) => onUpdateField("lightSurfacePreset", value as SurfacePresetName)}
            options={surfacePresetOptions}
            value={themeInput.lightSurfacePreset}
          />
          <SelectField
            label="Dark surface preset"
            onChange={(value) => onUpdateField("darkSurfacePreset", value as SurfacePresetName)}
            options={surfacePresetOptions}
            value={themeInput.darkSurfacePreset}
          />
          <SelectField
            label="Text treatment"
            onChange={(value) =>
              onUpdateField("textTreatment", value as TextTreatmentStrategyName)
            }
            options={textTreatmentOptions}
            value={themeInput.textTreatment}
          />
        </FormPanel>

        <FormPanel title="Primary">
          <TextField
            label="Primary light seed"
            onChange={(value) => onUpdateField("primarySeed", value)}
            value={themeInput.primarySeed}
          />
          <TextField
            label="Primary dark seed"
            onChange={(value) => onUpdateField("primaryDarkSeed", value)}
            value={themeInput.primaryDarkSeed}
          />
          <SelectField
            label="Primary policy"
            onChange={(value) => onUpdateField("primarySeedPolicy", value as SeedPolicy)}
            options={seedPolicyOptions}
            value={themeInput.primarySeedPolicy}
          />
        </FormPanel>

        <FormPanel className="editor-panel-wide" title="Status colors">
          <div className="status-editor-grid">
            {statusFields.map((status) => (
              <div className="status-editor" key={status.key}>
                <h3>{status.label}</h3>
                <TextField
                  label="Light seed"
                  onChange={(value) => onUpdateField(`${status.key}Seed`, value)}
                  value={themeInput[`${status.key}Seed`]}
                />
                <TextField
                  label="Dark seed"
                  onChange={(value) => onUpdateField(`${status.key}DarkSeed`, value)}
                  value={themeInput[`${status.key}DarkSeed`]}
                />
                <SelectField
                  label="Policy"
                  onChange={(value) => onUpdateField(`${status.key}SeedPolicy`, value as SeedPolicy)}
                  options={seedPolicyOptions}
                  value={themeInput[`${status.key}SeedPolicy`]}
                />
              </div>
            ))}
          </div>
        </FormPanel>

        <CustomRolesEditor
          engine={engine}
          onAddRole={onAddRole}
          onRemoveRole={onRemoveRole}
          onUpdateRole={onUpdateRole}
          roles={authoredRoles}
        />
      </section>
    </PageFrame>
  );
}

function PreviewPage({ engine }: { readonly engine: EngineState }) {
  return (
    <PageFrame
      eyebrow="Preview"
      title="Theme Preview"
      summary="Theme boundaries use the generated semantic CSS variables from the active input."
    >
      {engine.kind === "ready" ? (
        <ThemePreviewGrid output={engine.output} />
      ) : (
        <EngineNotice engine={engine} />
      )}
    </PageFrame>
  );
}

function RegionsPage({
  authoredRoles,
  engine,
  mappings,
  onUpdateRegion,
}: {
  readonly authoredRoles: readonly AuthoredCustomRole[];
  readonly engine: EngineState;
  readonly mappings: readonly AuthoredRegionMapping[];
  readonly onUpdateRegion: (
    regionId: RegionId,
    patch: Partial<Omit<AuthoredRegionMapping, "id">>,
  ) => void;
}) {
  return (
    <PageFrame
      eyebrow="Regions"
      title="Region Semantics"
      summary="Map custom color roles to complete header, sidebar, and footer treatments before component APIs get involved."
    >
      {engine.kind === "ready" ? (
        <RegionMappingReview
          mappings={mappings}
          onUpdateRegion={onUpdateRegion}
          output={engine.output}
          roles={authoredRoles}
        />
      ) : (
        <EngineNotice engine={engine} />
      )}
    </PageFrame>
  );
}

function ArtifactsPage({
  engine,
  mappings,
  roles,
}: {
  readonly engine: EngineState;
  readonly mappings: readonly AuthoredRegionMapping[];
  readonly roles: readonly AuthoredCustomRole[];
}) {
  return (
    <PageFrame
      eyebrow="Delivery"
      title="Artifacts"
      summary="Inspect and export the generated CSS products derived from the active normalized input."
    >
      <ChecklistPanel title="Expected artifact set" items={artifactSections} />
      {engine.kind === "ready" ? (
        <ArtifactPreview mappings={mappings} output={engine.output} roles={roles} />
      ) : (
        <EngineNotice engine={engine} />
      )}
    </PageFrame>
  );
}

function DiagnosticsPage({
  engine,
  mappings,
  roles,
}: {
  readonly engine: EngineState;
  readonly mappings: readonly AuthoredRegionMapping[];
  readonly roles: readonly AuthoredCustomRole[];
}) {
  return (
    <PageFrame
      eyebrow="Review"
      title="Diagnostics"
      summary="Review APCA results in authoring terms before exporting generated theme artifacts."
    >
      {engine.kind === "ready" ? (
        <DiagnosticsReview mappings={mappings} output={engine.output} roles={roles} />
      ) : (
        <>
          <ChecklistPanel title="Diagnostic groups" items={diagnosticSections} />
          <EngineNotice engine={engine} />
        </>
      )}
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

function FormPanel({
  children,
  className,
  title,
}: {
  readonly children: ReactNode;
  readonly className?: string;
  readonly title: string;
}) {
  return (
    <section className={className ? `panel ${className}` : "panel"}>
      <div className="panel-header">
        <h2>{title}</h2>
      </div>
      <div className="form-grid">{children}</div>
    </section>
  );
}

function TextField({
  disabled = false,
  error,
  label,
  onChange,
  value,
}: {
  readonly disabled?: boolean;
  readonly error?: string | undefined;
  readonly label: string;
  readonly onChange: (value: string) => void;
  readonly value: string;
}) {
  return (
    <label className={error ? "field field-error" : "field"}>
      <span>{label}</span>
      <input
        aria-invalid={error ? true : undefined}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        value={value}
      />
      {error ? <small>{error}</small> : null}
    </label>
  );
}

function CustomRolesEditor({
  engine,
  onAddRole,
  onRemoveRole,
  onUpdateRole,
  roles,
}: {
  readonly engine: EngineState;
  readonly onAddRole: () => void;
  readonly onRemoveRole: (roleKey: string) => void;
  readonly onUpdateRole: (
    roleKey: string,
    patch: Partial<Omit<AuthoredCustomRole, "key">>,
  ) => void;
  readonly roles: readonly AuthoredCustomRole[];
}) {
  const idErrors = new Map(validateAuthoredRoleIds(roles).map((error) => [
    error.roleKey,
    error.message,
  ]));

  return (
    <section className="panel editor-panel-wide custom-role-panel">
      <div className="panel-header custom-role-panel-header">
        <div>
          <h2>Custom color roles</h2>
          <p className="panel-copy">
            Enabled roles become normalized color-engine input and generated
            <code> --ds-role-*</code> aliases. Dark seed is optional.
          </p>
        </div>
        <button className="secondary-action" onClick={onAddRole} type="button">
          Add role
        </button>
      </div>

      <div className="custom-role-list">
        {roles.length === 0 ? (
          <p className="diagnostic-empty">No custom roles authored. Add one to map regions.</p>
        ) : roles.map((role) => {
          const engineRoleError = engine.kind === "error" && engine.roleKey === role.key
            ? engine.message
            : undefined;
          const engineRoleField = engine.kind === "error" && engine.roleKey === role.key
            ? engine.field
            : undefined;
          const idError = idErrors.get(role.key);

          return (
            <article
              aria-labelledby={`custom-role-${role.key}-title`}
              className={role.enabled ? "custom-role-card" : "custom-role-card custom-role-card-disabled"}
              key={role.key}
            >
              <div className="custom-role-card-header">
                <h3 id={`custom-role-${role.key}-title`}>
                  {role.id || "Untitled role"}
                </h3>
                <label className="toggle-field">
                  <input
                    aria-label={`${role.enabled ? "Disable" : "Enable"} ${role.id || "untitled role"}`}
                    checked={role.enabled}
                    onChange={(event) => onUpdateRole(role.key, { enabled: event.target.checked })}
                    type="checkbox"
                  />
                  <span>{role.enabled ? "Enabled" : "Disabled"}</span>
                </label>
                <button
                  aria-label={`Remove ${role.id || "untitled role"}`}
                  className="danger-action"
                  onClick={() => onRemoveRole(role.key)}
                  type="button"
                >
                  Remove
                </button>
              </div>
              <div className="custom-role-fields">
                <TextField
                  error={idError}
                  label="Role ID"
                  onChange={(id) => onUpdateRole(role.key, { id })}
                  value={role.id}
                />
                <TextField
                  error={engineRoleError && engineRoleField?.endsWith(".seed") ? engineRoleError : undefined}
                  label="Light seed"
                  onChange={(lightSeed) => onUpdateRole(role.key, { lightSeed })}
                  value={role.lightSeed}
                />
                <TextField
                  error={engineRoleError && engineRoleField?.endsWith(".darkSeed") ? engineRoleError : undefined}
                  label="Dark seed (optional)"
                  onChange={(darkSeed) => onUpdateRole(role.key, { darkSeed })}
                  value={role.darkSeed}
                />
                <SelectField
                  label="Seed policy"
                  onChange={(seedPolicy) => onUpdateRole(role.key, { seedPolicy: seedPolicy as SeedPolicy })}
                  options={seedPolicyOptions}
                  value={role.seedPolicy}
                />
              </div>
              {engineRoleError && !idError && !engineRoleField?.endsWith(".seed") && !engineRoleField?.endsWith(".darkSeed") ? (
                <p className="field-inline-error">{engineRoleError}</p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  readonly label: string;
  readonly onChange: (value: string) => void;
  readonly options: readonly { readonly label: string; readonly value: string }[];
  readonly value: string;
}) {
  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    onChange(event.target.value);
  }

  return (
    <label className="field">
      <span>{label}</span>
      <select onChange={handleChange} value={value}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
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

function RegionMappingReview({
  mappings,
  onUpdateRegion,
  output,
  roles,
}: {
  readonly mappings: readonly AuthoredRegionMapping[];
  readonly onUpdateRegion: (
    regionId: RegionId,
    patch: Partial<Omit<AuthoredRegionMapping, "id">>,
  ) => void;
  readonly output: ColorEngineOutput;
  readonly roles: readonly AuthoredCustomRole[];
}) {
  const regions = createResolvedRegionMappings(output, mappings, roles);
  const diagnostics = createRegionDiagnostics(output, regions);
  const failed = diagnostics.filter((result) => !result.passed);
  const availableRoles = roles.filter((role) => role.enabled && output.customRoles[role.id]);
  const unresolvedMappings = mappings.filter((mapping) =>
    !regions.some((region) => region.id === mapping.id)
  );

  return (
    <section className="region-workspace" aria-label="Region semantic mapping review">
      <section className="region-intro-panel">
        <div>
          <span className="eyebrow">Mapping model</span>
          <h2>Complete role treatments</h2>
          <p>
            Regions choose a generated custom role and one treatment. The region then
            maps background, border, text, hover, and action aliases together instead
            of letting each component pick arbitrary custom colors.
          </p>
        </div>
        <div className="region-score">
          <strong>{diagnostics.length - failed.length}</strong>
          <span>of {diagnostics.length} region pairs pass</span>
        </div>
      </section>

      <section className="region-map-grid" aria-label="Region mapping controls">
        {mappings.map((mapping) => {
          const definition = regionDefinitions[mapping.id];
          const selectedAvailable = availableRoles.some((role) => role.key === mapping.roleKey);

          return (
            <article className="region-map-card region-map-editor" key={mapping.id}>
              <span className="eyebrow">{mapping.id}</span>
              <h3>{definition.label}</h3>
              <p>{definition.description}</p>
              <SelectField
                label="Authored role"
                onChange={(roleKey) => onUpdateRegion(mapping.id, { roleKey })}
                options={[
                  ...(!selectedAvailable ? [{
                    label: mapping.roleKey ? "Unavailable role" : "Create and enable a role",
                    value: mapping.roleKey,
                  }] : []),
                  ...availableRoles.map((role) => ({ label: toTitleLabel(role.id), value: role.key })),
                ]}
                value={selectedAvailable ? mapping.roleKey : mapping.roleKey || ""}
              />
              <SelectField
                label="Treatment"
                onChange={(treatment) => onUpdateRegion(mapping.id, { treatment: treatment as RegionTreatment })}
                options={[
                  { label: "Soft", value: "soft" },
                  { label: "Solid", value: "solid" },
                ]}
                value={mapping.treatment}
              />
              {!selectedAvailable ? (
                <p className="field-inline-error">Select an enabled, valid custom role.</p>
              ) : null}
            </article>
          );
        })}
      </section>

      <section className="region-map-grid" aria-label="Configured region mappings">
        {regions.map((region) => (
          <RegionMappingCard key={region.id} region={region} />
        ))}
      </section>

      <section className="region-preview-grid" aria-label="Region previews by theme">
        {previewThemes.map((theme) => (
          <article className="region-theme-preview generated-preview" data-theme-v2={theme.key} key={theme.key}>
            <header>
              <span>{theme.label}</span>
              <h2>Regional App Shell</h2>
              <p>{theme.note}</p>
            </header>
            <div className="region-shell-preview">
              {regions.map((region) => (
                <RegionExample
                  key={`${theme.key}-${region.id}`}
                  output={output}
                  region={region}
                  theme={theme.key}
                />
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="panel region-diagnostic-panel">
        <div className="panel-header">
          <h2>Region APCA diagnostics</h2>
          <span>{failed.length} failed / {diagnostics.length}</span>
        </div>
        <p className="panel-copy">
          Region diagnostics are generated from the mapped custom role aliases. They
          verify region text, links, and action text against their mapped backgrounds
          without adding component tone props.
        </p>
        <div className="region-diagnostic-list">
          {unresolvedMappings.map((mapping) => (
            <p className="diagnostic-empty" key={mapping.id}>
              {regionDefinitions[mapping.id].label} has no enabled role mapping.
            </p>
          ))}
          {diagnostics.map((result) => (
            <RegionDiagnosticRow key={result.id} result={result} />
          ))}
        </div>
      </section>
    </section>
  );
}

function RegionMappingCard({ region }: { readonly region: RegionResolvedMapping }) {
  return (
    <article className="region-map-card">
      <span className="eyebrow">{region.id}</span>
      <h3>{region.label}</h3>
      <p>{region.description}</p>
      <dl>
        <div>
          <dt>Role</dt>
          <dd>{region.roleLabel}</dd>
        </div>
        <div>
          <dt>Treatment</dt>
          <dd>{region.treatment}</dd>
        </div>
        <div>
          <dt>Background</dt>
          <dd><code>{region.semantics.bg}</code></dd>
        </div>
        <div>
          <dt>Text</dt>
          <dd><code>{region.semantics.text}</code></dd>
        </div>
        <div>
          <dt>Label text</dt>
          <dd>Contrast-resolved per theme</dd>
        </div>
      </dl>
    </article>
  );
}

function RegionExample({
  output,
  region,
  theme,
}: {
  readonly output: ColorEngineOutput;
  readonly region: RegionResolvedMapping;
  readonly theme: SurfaceTheme;
}) {
  const labelForeground = resolveRegionLabelForeground(output, region, theme);

  return (
    <section
      className={`region-example region-example-${region.id}`}
      style={createRegionStyle(region, labelForeground.token)}
    >
      <div>
        <span>{region.label}</span>
        <strong>{region.roleLabel}</strong>
      </div>
      <nav aria-label={`${region.label} links`}>
        <a href="#region-link" onClick={(event) => event.preventDefault()}>Overview</a>
        <a href="#region-link" onClick={(event) => event.preventDefault()}>Reports</a>
      </nav>
      <button type="button">Action</button>
    </section>
  );
}

function RegionDiagnosticRow({ result }: { readonly result: RegionDiagnosticResult }) {
  return (
    <article className={result.passed ? "region-diagnostic-row" : "region-diagnostic-row region-diagnostic-row-fail"}>
      <div>
        <span>{result.passed ? "Pass" : "Review"}</span>
        <strong>{getThemeLabel(result.theme)} {result.region.label}: {result.label}</strong>
      </div>
      <dl>
        <div>
          <dt>Current</dt>
          <dd>Lc {formatNumber(result.absLc)}</dd>
        </div>
        <div>
          <dt>Target</dt>
          <dd>Lc {result.threshold}</dd>
        </div>
        <div>
          <dt>Tokens</dt>
          <dd><code>{result.foregroundToken.name}</code> on <code>{result.backgroundToken.name}</code></dd>
        </div>
      </dl>
    </article>
  );
}

function DiagnosticsReview({
  mappings,
  output,
  roles,
}: {
  readonly mappings: readonly AuthoredRegionMapping[];
  readonly output: ColorEngineOutput;
  readonly roles: readonly AuthoredCustomRole[];
}) {
  const resolvedRegions = createResolvedRegionMappings(output, mappings, roles);
  const regionDiagnostics = createRegionDiagnostics(output, resolvedRegions);
  const regionFailures = regionDiagnostics.filter((result) => !result.passed);
  const missingRegionCount = mappings.length - resolvedRegions.length;
  const readiness = createReadinessSummary(output, regionFailures, missingRegionCount);
  const failures = output.assertions.results.filter((result) => !result.passed);
  const requiredFailures = failures.filter((result) => result.severity === "required");
  const advisoryFailures = failures.filter((result) => result.severity === "diagnostic");
  const customRoleResults = output.assertions.results.filter((result) =>
    isCustomRoleAssertion(result),
  );
  const customRoleFailures = customRoleResults.filter((result) => !result.passed);

  return (
    <section className="diagnostics-workspace" aria-label="Theme diagnostics review">
      <section className={`diagnostic-hero diagnostic-hero-${readiness.tone}`}>
        <div>
          <span className="eyebrow">Theme readiness</span>
          <h2>{readiness.title}</h2>
          <p>{readiness.summary}</p>
        </div>
        <div className="diagnostic-score">
          <strong>{output.assertions.summary.passed}</strong>
          <span>of {output.assertions.summary.total} pairs pass</span>
        </div>
      </section>

      <section className="summary-grid" aria-label="Diagnostic summary">
        <MetricCard
          label="Required failures"
          tone={output.assertions.summary.requiredFailed === 0 ? "good" : "bad"}
          value={output.assertions.summary.requiredFailed.toString()}
        />
        <MetricCard
          label="Advisory failures"
          tone={output.assertions.summary.diagnosticFailed === 0 ? "good" : "neutral"}
          value={output.assertions.summary.diagnosticFailed.toString()}
        />
        <MetricCard
          label="Region failures"
          tone={regionFailures.length === 0 && missingRegionCount === 0 ? "good" : "bad"}
          value={`${regionFailures.length + missingRegionCount}`}
        />
      </section>

      <section className="diagnostic-guidance-grid" aria-label="Export guidance">
        <DiagnosticGuidanceCard
          body={readiness.exportGuidance}
          title="Export guidance"
          tone={readiness.tone}
        />
        <DiagnosticGuidanceCard
          body="Required pairs cover normal text, controls, primary actions, and color role text. Advisory pairs cover lower-emphasis muted text where some product teams may accept softer contrast."
          title="Review model"
        />
        <DiagnosticGuidanceCard
          body={Object.entries(output.assertions.thresholds)
            .map(([role, threshold]) => {
              const roleName = assertionRoleLabels[role as ContrastAssertionRole];

              return `${roleName} Lc ${threshold}`;
            })
            .join("; ")}
          title="Thresholds"
        />
      </section>

      <section className="diagnostic-theme-grid" aria-label="Diagnostics by theme">
        {previewThemes.map((theme) => {
          const results = output.assertions.results.filter((result) => result.theme === theme.key);
          const failed = results.filter((result) => !result.passed);
          const requiredFailed = failed.filter((result) => result.severity === "required");

          return (
            <article className="diagnostic-theme-card" key={theme.key}>
              <div>
                <span className="eyebrow">{theme.label}</span>
                <h3>{requiredFailed.length === 0 ? "Usable" : "Needs review"}</h3>
              </div>
              <p>
                {results.length - failed.length} of {results.length} pairs pass.
                {requiredFailed.length > 0
                  ? ` ${requiredFailed.length} required pair(s) need attention.`
                  : " Required pairs are clear."}
              </p>
            </article>
          );
        })}
      </section>

      <DiagnosticIssuePanel
        emptyMessage="No required contrast failures for the active input."
        results={requiredFailures}
        title="Required issues"
      />
      <DiagnosticIssuePanel
        emptyMessage="No advisory failures for the active input."
        results={advisoryFailures}
        title="Advisory issues"
      />

      <section className="panel region-diagnostic-panel">
        <div className="panel-header">
          <h2>Region issues</h2>
          <span>{regionFailures.length} failed / {regionDiagnostics.length}; {missingRegionCount} unmapped</span>
        </div>
        <p className="panel-copy">
          Header, sidebar, and footer mappings are checked as complete region
          treatments. These pairs are separate from component tone props.
        </p>
        <div className="region-diagnostic-list">
          {missingRegionCount > 0 ? (
            <p className="diagnostic-empty">
              {missingRegionCount} region mapping(s) need an enabled authored role.
            </p>
          ) : null}
          {regionFailures.length > 0 ? (
            regionFailures.map((result) => (
              <RegionDiagnosticRow key={result.id} result={result} />
            ))
          ) : (
            <p className="diagnostic-empty">No region contrast failures for the active input.</p>
          )}
        </div>
      </section>

      {customRoleResults.length > 0 ? (
        <section className="panel">
          <div className="panel-header">
            <h2>Custom color roles</h2>
            <span>{customRoleFailures.length} failed / {customRoleResults.length}</span>
          </div>
          <p className="panel-copy">
            Custom role diagnostics use the same soft and solid color-role thresholds
            as status roles. They are generated extensions and do not change built-in
            primary or status semantics.
          </p>
        </section>
      ) : null}
    </section>
  );
}

function DiagnosticGuidanceCard({
  body,
  title,
  tone = "neutral",
}: {
  readonly body: string;
  readonly title: string;
  readonly tone?: DiagnosticReadinessTone;
}) {
  return (
    <article className={`diagnostic-guidance-card diagnostic-guidance-card-${tone}`}>
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  );
}

function DiagnosticIssuePanel({
  emptyMessage,
  results,
  title,
}: {
  readonly emptyMessage: string;
  readonly results: readonly ResolvedContrastAssertion[];
  readonly title: string;
}) {
  return (
    <section className="panel diagnostic-issue-panel">
      <div className="panel-header">
        <h2>{title}</h2>
        <span>{results.length} pairs</span>
      </div>
      {results.length > 0 ? (
        <div className="diagnostic-issue-list">
          {sortDiagnosticResults(results).map((result) => (
            <DiagnosticIssueCard key={result.id} result={result} />
          ))}
        </div>
      ) : (
        <p className="diagnostic-empty">{emptyMessage}</p>
      )}
    </section>
  );
}

function DiagnosticIssueCard({ result }: { readonly result: ResolvedContrastAssertion }) {
  const gap = Math.max(0, result.threshold - result.absLc);

  return (
    <article className="diagnostic-issue-card">
      <div className="diagnostic-issue-main">
        <span className="diagnostic-severity">{result.severity}</span>
        <div>
          <h3>{toDiagnosticIssueTitle(result)}</h3>
          <p>{toDiagnosticIssueExplanation(result)}</p>
        </div>
      </div>
      <dl className="diagnostic-metrics">
        <div>
          <dt>Theme</dt>
          <dd>{getThemeLabel(result.theme)}</dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>{assertionRoleLabels[result.role]}</dd>
        </div>
        <div>
          <dt>Current</dt>
          <dd>Lc {formatNumber(result.absLc)}</dd>
        </div>
        <div>
          <dt>Target</dt>
          <dd>Lc {result.threshold}</dd>
        </div>
        <div>
          <dt>Gap</dt>
          <dd>{formatNumber(gap)}</dd>
        </div>
      </dl>
      <div className="diagnostic-token-row" aria-label="Resolved token pair">
        <code>{result.foregroundToken.name}</code>
        <span>on</span>
        <code>{result.backgroundToken.name}</code>
      </div>
    </article>
  );
}

function EngineNotice({ engine }: { readonly engine: EngineState }) {
  if (engine.kind === "ready") {
    return (
      <section className="engine-notice engine-notice-ready">
        <strong>Input valid</strong>
        <span>
          Generated CSS is available for {engine.output.cssOutput.files.length} ordered files.
        </span>
      </section>
    );
  }

  return (
    <section className="engine-notice engine-notice-error">
      <strong>{engine.field ? `${engine.field} needs attention` : "Input needs attention"}</strong>
      <span>{engine.message}</span>
    </section>
  );
}

function MetricCard({
  label,
  tone = "neutral",
  value,
}: {
  readonly label: string;
  readonly tone?: "neutral" | "good" | "bad";
  readonly value: string;
}) {
  return (
    <article className={`metric-card metric-card-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function ThemePreviewGrid({ output }: { readonly output: ColorEngineOutput }) {
  return (
    <section className="theme-preview-grid" aria-label="Generated theme previews">
      {previewThemes.map((theme) => (
        <article
          className="theme-preview generated-preview"
          data-theme-v2={theme.key}
          key={theme.key}
        >
          <header className="preview-chrome">
            <div>
              <span>{theme.label}</span>
              <h2>Workspace Review</h2>
              <p>{theme.note}</p>
            </div>
            <button className="preview-primary-button" type="button">
              Create
            </button>
          </header>

          <div className="preview-app-layout">
            <nav className="preview-side-nav" aria-label={`${theme.label} preview sections`}>
              <a
                className="preview-nav-item preview-nav-item-active"
                href="#preview-current"
                onClick={(event) => event.preventDefault()}
              >
                Dashboard
              </a>
              <a
                className="preview-nav-item"
                href="#preview-queue"
                onClick={(event) => event.preventDefault()}
              >
                Queue
              </a>
              <a
                className="preview-nav-item"
                href="#preview-reports"
                onClick={(event) => event.preventDefault()}
              >
                Reports
              </a>
            </nav>

            <section className="preview-main-surface" aria-label={`${theme.label} app surface`}>
              <div className="preview-surface-stack" aria-label="Nested surfaces">
                <article className="preview-surface-card">
                  <span>Surface 2</span>
                  <strong>Base panel</strong>
                  <p>Primary text, secondary text, and subtle borders sit together here.</p>
                </article>
                <article className="preview-surface-card preview-surface-card-raised">
                  <span>Surface 3</span>
                  <strong>Raised detail</strong>
                  <p>Panels should remain distinct without becoming visually noisy.</p>
                </article>
                <article className="preview-surface-card preview-surface-card-high">
                  <span>Surface 4</span>
                  <strong>Focused content</strong>
                  <p>Highest local emphasis for dense review states.</p>
                </article>
              </div>

              <div className="preview-actions" aria-label="Action treatment">
                <button className="preview-primary-button" type="button">
                  Primary action
                </button>
                <a href="#preview-link" onClick={(event) => event.preventDefault()}>
                  Primary link
                </a>
                <button className="preview-control-button" type="button">
                  Secondary
                </button>
                <button className="preview-focus-button" type="button">
                  Focus
                </button>
              </div>

              <div className="preview-status-grid" aria-label="Status treatment">
                <PreviewStatus status="danger" />
                <PreviewStatus status="warning" />
                <PreviewStatus status="success" />
                <PreviewStatus status="info" />
              </div>

              {Object.values(output.customRoles).length > 0 ? (
                <div className="preview-custom-role-grid" aria-label="Authored custom role treatments">
                  {Object.values(output.customRoles).map((role) => (
                    <PreviewCustomRole
                      key={role.id}
                      namespace={output.input.namespace}
                      role={role}
                    />
                  ))}
                </div>
              ) : null}
            </section>
          </div>
        </article>
      ))}
      <div className="output-footnote">
        Generated namespace: <code>--{output.input.namespace}-*</code>
      </div>
    </section>
  );
}

function PreviewCustomRole({
  namespace,
  role,
}: {
  readonly namespace: string;
  readonly role: ColorEngineOutput["customRoles"][string];
}) {
  const style = {
    "--custom-role-soft-bg": cssVar(namespace, role.cssAliases["soft-bg"]),
    "--custom-role-soft-border": cssVar(namespace, role.cssAliases["soft-border"]),
    "--custom-role-soft-text": cssVar(namespace, role.cssAliases["soft-text"]),
    "--custom-role-solid-bg": cssVar(namespace, role.cssAliases["solid-bg"]),
    "--custom-role-solid-text": cssVar(namespace, role.cssAliases["solid-text"]),
  } as CSSProperties;

  return (
    <article className="preview-custom-role" style={style}>
      <div>
        <span>Custom role</span>
        <strong>{toTitleLabel(role.id)}</strong>
      </div>
      <b>Solid</b>
    </article>
  );
}

function PreviewStatus({
  status,
}: {
  readonly status: "danger" | "warning" | "success" | "info";
}) {
  const label = toTitleLabel(status);

  return (
    <article className={`preview-status preview-status-${status}`}>
      <div className="preview-status-soft">
        <strong>{label} soft</strong>
        <p>Soft surface, border, and text.</p>
      </div>
      <div className="preview-status-solid">{label} solid</div>
    </article>
  );
}

function ArtifactPreview({
  mappings,
  output,
  roles,
}: {
  readonly mappings: readonly AuthoredRegionMapping[];
  readonly output: ColorEngineOutput;
  readonly roles: readonly AuthoredCustomRole[];
}) {
  const files = useMemo(
    () => createArtifactPreviewFiles(output, mappings, roles),
    [mappings, output, roles],
  );
  const [selectedFileName, setSelectedFileName] =
    useState<ArtifactFileName>("primitives.css");
  const [notice, setNotice] = useState("Artifacts update from the active input.");
  const codeRef = useRef<HTMLElement | null>(null);
  const fallbackFile = files[0];

  if (!fallbackFile) {
    return <EngineNotice engine={{ kind: "error", message: "No artifacts were generated." }} />;
  }

  const selectedFile = files.find((file) => file.fileName === selectedFileName) ?? fallbackFile;

  async function copySelectedFile() {
    const copied = await copyTextToClipboard(selectedFile.content);

    if (copied) {
      setNotice(`Copied ${selectedFile.fileName}.`);
    } else {
      selectElementText(codeRef.current);
      setNotice("Copy unavailable. Artifact text selected for manual copy.");
    }
  }

  function downloadSelectedFile() {
    downloadTextFile(selectedFile.fileName, selectedFile.content);
    setNotice(`Prepared ${selectedFile.fileName} for download.`);
  }

  function downloadBundle() {
    const bundle = files.find((file) => file.fileName === "bundle.css");

    if (!bundle) {
      setNotice("Bundled CSS is not available.");
      return;
    }

    downloadTextFile(bundle.fileName, bundle.content);
    setNotice("Prepared bundle.css for download.");
  }

  return (
    <section className="artifact-workspace" aria-label="Generated artifact preview">
      <div className="summary-grid" aria-label="Artifact output summary">
        <MetricCard label="CSS files" value={output.cssOutput.files.length.toString()} />
        <MetricCard label="Namespace" value={`--${output.input.namespace}-*`} />
        <MetricCard label="Bundle size" value={formatByteLength(output.cssOutput.all)} />
      </div>

      <section className="artifact-manifest-panel">
        <div>
          <span className="eyebrow">Manifest</span>
          <h2>Derived artifact inventory</h2>
          <p>
            The manifest records the generated file names, load order, hashes,
            byte lengths, and theme selector contract. It is generated from the
            same active input as the CSS preview.
          </p>
        </div>
        <div className="artifact-file-list" aria-label="Generated file load order">
          {output.cssOutput.files.map((file, index) => {
            const artifact = files.find((candidate) => candidate.fileName === file.fileName);

            return (
              <div className="artifact-file-row" key={file.fileName}>
                <span>{index + 1}</span>
                <strong>{file.fileName}</strong>
                <code>{artifact?.contentHash ?? "metadata pending"}</code>
              </div>
            );
          })}
        </div>
      </section>

      <section className="artifact-browser panel">
        <div className="panel-header">
          <div>
            <h2>Artifact preview</h2>
            <p className="panel-copy">{selectedFile.meta}</p>
          </div>
          <span>{formatByteLength(selectedFile.content)}</span>
        </div>

        <div className="artifact-toolbar">
          <label className="field artifact-select">
            <span>File</span>
            <select
              onChange={(event) => setSelectedFileName(event.target.value as ArtifactFileName)}
              value={selectedFile.fileName}
            >
              {files.map((file) => (
                <option key={file.fileName} value={file.fileName}>
                  {file.label}
                </option>
              ))}
            </select>
          </label>
          <div className="artifact-actions">
            <button onClick={copySelectedFile} type="button">
              Copy
            </button>
            <button onClick={downloadSelectedFile} type="button">
              Download file
            </button>
            <button onClick={downloadBundle} type="button">
              Download bundle
            </button>
          </div>
        </div>

        <p className="artifact-notice" aria-live="polite">
          {notice}
        </p>
        <pre className="artifact-code">
          <code ref={codeRef}>{selectedFile.content}</code>
        </pre>
      </section>
    </section>
  );
}

function EngineStyles({ css }: { readonly css: string }) {
  return <style>{css}</style>;
}

function createEngineState(
  input: EditableThemeInput,
  roles: readonly AuthoredCustomRole[],
): EngineState {
  const roleIdError = validateAuthoredRoleIds(roles)[0];

  if (roleIdError) {
    return {
      kind: "error",
      field: "customRoles",
      message: roleIdError.message,
      roleKey: roleIdError.roleKey,
    };
  }

  try {
    return {
      kind: "ready",
      output: createColorEngineTheme(toColorEngineInput(input, roles)),
    };
  } catch (error) {
    if (error instanceof ColorEngineValidationError) {
      const roleKey = getEngineFieldRoleKey(error.field, roles);

      return {
        kind: "error",
        field: error.field,
        message: error.message,
        ...(roleKey ? { roleKey } : {}),
      };
    }

    return {
      kind: "error",
      message: error instanceof Error ? error.message : "Unknown color engine error.",
    };
  }
}

function toColorEngineInput(
  input: EditableThemeInput,
  roles: readonly AuthoredCustomRole[],
): ColorEngineInput {
  const output: ColorEngineInput = {
    ...input,
    namespace: input.namespace.trim(),
    customRoles: createNormalizedCustomRoles(roles),
  };
  return output;
}

function toTitleLabel(value: string): string {
  return value
    .split("-")
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

function createArtifactPreviewFiles(
  output: ColorEngineOutput,
  mappings: readonly AuthoredRegionMapping[],
  roles: readonly AuthoredCustomRole[],
): readonly ArtifactPreviewFile[] {
  const artifacts = createColorEngineCssArtifacts(output);
  const bundle = output.cssOutput.all;
  const manifest = createArtifactManifest(output, artifacts, bundle, mappings, roles);

  return [
    ...artifacts.map((artifact) => ({
      fileName: artifact.fileName,
      label: artifact.fileName,
      meta:
        artifact.kind === "theme" && artifact.theme
          ? `${artifact.kind} CSS for data-theme-v2="${artifact.theme}"`
          : "Root primitive CSS loaded before theme files",
      content: artifact.css,
      byteLength: artifact.byteLength,
      contentHash: artifact.contentHash,
    })),
    {
      fileName: "bundle.css",
      label: "bundle.css",
      meta: "Convenience bundle equal to cssOutput.all / output.css",
      content: bundle,
      byteLength: getTextByteLength(bundle),
    },
    {
      fileName: "manifest.json",
      label: "manifest.json",
      meta: "Derived metadata for static publishing or tenant theme storage",
      content: manifest,
      byteLength: getTextByteLength(manifest),
    },
  ];
}

function createArtifactManifest(
  output: ColorEngineOutput,
  artifacts: readonly ColorEngineCssArtifact[],
  bundle: string,
  mappings: readonly AuthoredRegionMapping[],
  roles: readonly AuthoredCustomRole[],
): string {
  return JSON.stringify(
    {
      schemaVersion: 1,
      generatedBy: "@puzzlefactory/color-engine",
      namespace: output.input.namespace,
      themeAttribute: "data-theme-v2",
      themes: ["light", "dark", "high-contrast", "high-contrast-dark"],
      normalizedThemeInput: output.input,
      regionMappings: normalizeRegionMappings(mappings, roles),
      loadOrder: artifacts.map((artifact) => artifact.fileName),
      files: artifacts.map((artifact) => ({
        fileName: artifact.fileName,
        kind: artifact.kind,
        theme: artifact.theme,
        byteLength: artifact.byteLength,
        contentHash: artifact.contentHash,
      })),
      bundle: {
        fileName: "bundle.css",
        byteLength: getTextByteLength(bundle),
        source: "cssOutput.all",
      },
    },
    null,
    2,
  );
}

function createResolvedRegionMappings(
  output: ColorEngineOutput,
  mappings: readonly AuthoredRegionMapping[],
  roles: readonly AuthoredCustomRole[],
): readonly RegionResolvedMapping[] {
  const rolesByKey = new Map(roles.map((role) => [role.key, role]));

  return mappings.flatMap((mapping) => {
    const authoredRole = rolesByKey.get(mapping.roleKey);
    const role = authoredRole?.enabled ? output.customRoles[authoredRole.id] : undefined;

    if (!role) {
      return [];
    }

    const backgroundPart = mapping.treatment === "solid" ? "solid-bg" : "soft-bg";
    const hoverPart = mapping.treatment === "solid" ? "solid-bg-hover" : "soft-bg-hover";
    const borderPart = mapping.treatment === "solid" ? "solid-bg-pressed" : "soft-border";
    const textPart = mapping.treatment === "solid" ? "solid-text" : "soft-text";
    const actionTreatment = mapping.treatment === "solid" ? "soft" : "solid";
    const actionBackgroundPart = actionTreatment === "solid" ? "solid-bg" : "soft-bg";
    const actionHoverPart = actionTreatment === "solid" ? "solid-bg-hover" : "soft-bg-hover";
    const actionTextPart = actionTreatment === "solid" ? "solid-text" : "soft-text";

    return [{
      ...mapping,
      ...regionDefinitions[mapping.id],
      namespace: output.input.namespace,
      roleLabel: toTitleLabel(role.id),
      semantics: {
        bg: role.cssAliases[backgroundPart],
        "bg-hover": role.cssAliases[hoverPart],
        border: role.cssAliases[borderPart],
        text: role.cssAliases[textPart],
        "action-bg": role.cssAliases[actionBackgroundPart],
        "action-bg-hover": role.cssAliases[actionHoverPart],
        "action-text": role.cssAliases[actionTextPart],
      },
    }];
  });
}

function createRegionStyle(
  region: RegionResolvedMapping,
  labelForeground: ColorToken,
): RegionStyle {
  return {
    "--region-bg": cssVar(region.namespace, region.semantics.bg),
    "--region-bg-hover": cssVar(region.namespace, region.semantics["bg-hover"]),
    "--region-border": cssVar(region.namespace, region.semantics.border),
    "--region-text": cssVar(region.namespace, region.semantics.text),
    "--region-label-text": cssVar(region.namespace, labelForeground.name),
    "--region-action-bg": cssVar(region.namespace, region.semantics["action-bg"]),
    "--region-action-bg-hover": cssVar(region.namespace, region.semantics["action-bg-hover"]),
    "--region-action-text": cssVar(region.namespace, region.semantics["action-text"]),
  };
}

function cssVar(namespace: string, semanticName: string): `var(--${string})` {
  return `var(--${namespace}-${semanticName})`;
}

type DiagnosticReadinessTone = "good" | "review" | "bad" | "neutral";

function createReadinessSummary(
  output: ColorEngineOutput,
  regionFailures: readonly RegionDiagnosticResult[] = [],
  missingRegionCount = 0,
): {
  readonly title: string;
  readonly summary: string;
  readonly exportGuidance: string;
  readonly tone: DiagnosticReadinessTone;
} {
  const { diagnosticFailed, requiredFailed } = output.assertions.summary;

  if (requiredFailed > 0 || regionFailures.length > 0 || missingRegionCount > 0) {
    return {
      title: "Not ready to export",
      summary:
        "At least one required text, UI, or region contrast pair misses its APCA target. Review the affected theme and role before treating this theme as production-ready.",
      exportGuidance:
        "Keep this theme in draft. The CSS can still be inspected, but generated artifacts should not be published as approved tenant output until required or region failures are resolved or intentionally accepted.",
      tone: "bad",
    };
  }

  if (diagnosticFailed > 0) {
    return {
      title: "Ready with advisory notes",
      summary:
        "Required pairs pass. Some lower-emphasis diagnostic pairs are softer than their APCA targets and should be reviewed against the intended product context.",
      exportGuidance:
        "This theme can move forward for review. Export is reasonable if the advisory failures are visually acceptable for the intended density and content.",
      tone: "review",
    };
  }

  return {
    title: "Ready to export",
    summary:
      "All required and advisory APCA pairs pass for the generated light, dark, high-contrast, and high-contrast-dark themes.",
    exportGuidance:
      "This theme is ready for artifact export from a contrast diagnostics perspective. Continue visual review for brand fit, surface separation, and component composition.",
    tone: "good",
  };
}

function sortDiagnosticResults(
  results: readonly ResolvedContrastAssertion[],
): readonly ResolvedContrastAssertion[] {
  return [...results].sort((left, right) => {
    const severityDelta = severityWeight(right.severity) - severityWeight(left.severity);

    if (severityDelta !== 0) {
      return severityDelta;
    }

    return (right.threshold - right.absLc) - (left.threshold - left.absLc);
  });
}

function severityWeight(severity: ResolvedContrastAssertion["severity"]): number {
  return severity === "required" ? 2 : 1;
}

function toDiagnosticIssueTitle(result: ResolvedContrastAssertion): string {
  return `${getThemeLabel(result.theme)}: ${toSentenceLabel(result.description)}`;
}

function toDiagnosticIssueExplanation(result: ResolvedContrastAssertion): string {
  const role = assertionRoleLabels[result.role].toLowerCase();
  const need =
    result.severity === "required"
      ? "This pair is part of the required theme contract."
      : "This pair is advisory for lower-emphasis text.";
  const customRoleNote = isCustomRoleAssertion(result)
    ? " It comes from a custom color role, so tune that role seed or policy rather than changing built-in status colors."
    : "";

  return `${need} The ${role} contrast is Lc ${formatNumber(result.absLc)} against a target of Lc ${result.threshold}.${customRoleNote}`;
}

function getThemeLabel(theme: SurfaceTheme): string {
  return previewThemes.find((candidate) => candidate.key === theme)?.label ?? toTitleLabel(theme);
}

function isCustomRoleAssertion(result: ResolvedContrastAssertion): boolean {
  return result.foreground.startsWith("role-") || result.background.startsWith("role-");
}

function toSentenceLabel(value: string): string {
  const readable = value.replaceAll("-", " ");

  return `${readable[0]?.toUpperCase() ?? ""}${readable.slice(1)}`;
}

function downloadTextFile(fileName: string, content: string) {
  const blob = new Blob([content], {
    type: fileName.endsWith(".json") ? "application/json" : "text/css",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function copyTextToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const textArea = document.createElement("textarea");

    textArea.value = value;
    textArea.setAttribute("readonly", "true");
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.append(textArea);
    textArea.focus();
    textArea.select();

    try {
      return document.execCommand("copy");
    } finally {
      textArea.remove();
    }
  }
}

function selectElementText(element: HTMLElement | null) {
  if (!element) {
    return;
  }

  const range = document.createRange();
  const selection = window.getSelection();

  selection?.removeAllRanges();
  range.selectNodeContents(element);
  selection?.addRange(range);
}

function getTextByteLength(value: string): number {
  return new Blob([value]).size;
}

function formatByteLength(value: string | number): string {
  const bytes = typeof value === "number" ? value : getTextByteLength(value);

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}
