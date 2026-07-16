export const PUZZLEFACTORY_COMPONENT_TAG_NAMES = [
  "pf-button",
  "pf-alert",
  "pf-badge",
  "pf-card",
] as const;

export type PuzzleFactoryComponentTagName = (typeof PUZZLEFACTORY_COMPONENT_TAG_NAMES)[number];
export type PfButtonVariant = "primary" | "secondary";
export type PfAlertStatus = "danger" | "warning" | "success" | "info";
export type PfAlertVariant = "soft" | "solid";
export type PfBadgeStatus = PfAlertStatus;
export type PfBadgeVariant = "soft" | "solid";
export type PfCardVariant = "default" | "raised";

const HTMLElementBase = (
  globalThis.HTMLElement ?? class {}
) as typeof HTMLElement;

const buttonTemplate = documentSafeTemplate(`
  <style>
    :host {
      display: inline-block;
      vertical-align: middle;
    }

    :host([hidden]) {
      display: none;
    }

    .button {
      display: inline-flex;
      min-width: 0;
      min-height: 40px;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: 1px solid var(--pf-button-border, var(--ds-primary-action-bg));
      border-radius: 6px;
      padding: 0 14px;
      background: var(--pf-button-bg, var(--ds-primary-action-bg));
      color: var(--pf-button-text, var(--ds-primary-action-text));
      font: inherit;
      font-weight: 800;
      line-height: 1;
      text-align: center;
      white-space: nowrap;
      cursor: pointer;
    }

    :host([variant="secondary"]) {
      --pf-button-bg: var(--ds-control-bg);
      --pf-button-border: var(--ds-control-border);
      --pf-button-text: var(--ds-control-text);
      --pf-button-hover-bg: var(--ds-control-bg-hover);
      --pf-button-hover-border: var(--ds-border-strong);
      --pf-button-active-bg: var(--ds-surface-2-pressed);
      --pf-button-active-border: var(--ds-border-strong);
    }

    .button:hover {
      border-color: var(--pf-button-hover-border, var(--ds-primary-action-bg-hover));
      background: var(--pf-button-hover-bg, var(--ds-primary-action-bg-hover));
    }

    .button:active {
      border-color: var(--pf-button-active-border, var(--ds-primary-action-bg-pressed));
      background: var(--pf-button-active-bg, var(--ds-primary-action-bg-pressed));
    }

    .button:focus-visible {
      outline: 3px solid var(--ds-primary-focus-ring);
      outline-offset: 2px;
    }

    .button:disabled,
    .button:disabled:hover,
    .button:disabled:active {
      border-color: var(--ds-control-border);
      background: var(--ds-control-bg);
      color: var(--ds-text-muted);
      cursor: not-allowed;
    }
  </style>
  <button class="button" part="button" type="button">
    <slot>Button</slot>
  </button>
`);

const alertTemplate = documentSafeTemplate(`
  <style>
    :host {
      --pf-alert-bg: var(--ds-info-soft-bg);
      --pf-alert-border: var(--ds-info-soft-border);
      --pf-alert-text: var(--ds-info-soft-text);
      --pf-alert-title: var(--ds-info-soft-text);
      display: block;
      min-width: 0;
    }

    :host([hidden]) {
      display: none;
    }

    :host([status="danger"]) {
      --pf-alert-bg: var(--ds-danger-soft-bg);
      --pf-alert-border: var(--ds-danger-soft-border);
      --pf-alert-text: var(--ds-danger-soft-text);
      --pf-alert-title: var(--ds-danger-soft-text);
    }

    :host([status="warning"]) {
      --pf-alert-bg: var(--ds-warning-soft-bg);
      --pf-alert-border: var(--ds-warning-soft-border);
      --pf-alert-text: var(--ds-warning-soft-text);
      --pf-alert-title: var(--ds-warning-soft-text);
    }

    :host([status="success"]) {
      --pf-alert-bg: var(--ds-success-soft-bg);
      --pf-alert-border: var(--ds-success-soft-border);
      --pf-alert-text: var(--ds-success-soft-text);
      --pf-alert-title: var(--ds-success-soft-text);
    }

    :host([variant="solid"]) {
      --pf-alert-bg: var(--ds-info-solid-bg);
      --pf-alert-border: var(--ds-info-solid-bg);
      --pf-alert-text: var(--ds-info-solid-text);
      --pf-alert-title: var(--ds-info-solid-text);
    }

    :host([variant="solid"][status="danger"]) {
      --pf-alert-bg: var(--ds-danger-solid-bg);
      --pf-alert-border: var(--ds-danger-solid-bg);
      --pf-alert-text: var(--ds-danger-solid-text);
      --pf-alert-title: var(--ds-danger-solid-text);
    }

    :host([variant="solid"][status="warning"]) {
      --pf-alert-bg: var(--ds-warning-solid-bg);
      --pf-alert-border: var(--ds-warning-solid-bg);
      --pf-alert-text: var(--ds-warning-solid-text);
      --pf-alert-title: var(--ds-warning-solid-text);
    }

    :host([variant="solid"][status="success"]) {
      --pf-alert-bg: var(--ds-success-solid-bg);
      --pf-alert-border: var(--ds-success-solid-bg);
      --pf-alert-text: var(--ds-success-solid-text);
      --pf-alert-title: var(--ds-success-solid-text);
    }

    .alert {
      display: grid;
      gap: 6px;
      min-width: 0;
      border: 1px solid var(--pf-alert-border);
      border-radius: 7px;
      padding: 12px;
      background: var(--pf-alert-bg);
      color: var(--pf-alert-text);
    }

    .title {
      color: var(--pf-alert-title);
      font-weight: 800;
      line-height: 1.25;
    }

    .body {
      color: var(--pf-alert-text, var(--ds-text-primary));
      line-height: 1.4;
    }
  </style>
  <div class="alert" part="alert" role="status">
    <div class="title" part="title">
      <slot name="title">Status</slot>
    </div>
    <div class="body" part="body">
      <slot></slot>
    </div>
  </div>
`);

const badgeTemplate = documentSafeTemplate(`
  <style>
    :host {
      --pf-badge-bg: var(--ds-info-soft-bg);
      --pf-badge-border: var(--ds-info-soft-border);
      --pf-badge-text: var(--ds-info-soft-text);
      display: inline-block;
      min-width: 0;
      vertical-align: middle;
    }

    :host([hidden]) {
      display: none;
    }

    :host([status="danger"]) {
      --pf-badge-bg: var(--ds-danger-soft-bg);
      --pf-badge-border: var(--ds-danger-soft-border);
      --pf-badge-text: var(--ds-danger-soft-text);
    }

    :host([status="warning"]) {
      --pf-badge-bg: var(--ds-warning-soft-bg);
      --pf-badge-border: var(--ds-warning-soft-border);
      --pf-badge-text: var(--ds-warning-soft-text);
    }

    :host([status="success"]) {
      --pf-badge-bg: var(--ds-success-soft-bg);
      --pf-badge-border: var(--ds-success-soft-border);
      --pf-badge-text: var(--ds-success-soft-text);
    }

    :host([variant="solid"]) {
      --pf-badge-bg: var(--ds-info-solid-bg);
      --pf-badge-border: var(--ds-info-solid-bg);
      --pf-badge-text: var(--ds-info-solid-text);
    }

    :host([variant="solid"][status="danger"]) {
      --pf-badge-bg: var(--ds-danger-solid-bg);
      --pf-badge-border: var(--ds-danger-solid-bg);
      --pf-badge-text: var(--ds-danger-solid-text);
    }

    :host([variant="solid"][status="warning"]) {
      --pf-badge-bg: var(--ds-warning-solid-bg);
      --pf-badge-border: var(--ds-warning-solid-bg);
      --pf-badge-text: var(--ds-warning-solid-text);
    }

    :host([variant="solid"][status="success"]) {
      --pf-badge-bg: var(--ds-success-solid-bg);
      --pf-badge-border: var(--ds-success-solid-bg);
      --pf-badge-text: var(--ds-success-solid-text);
    }

    .badge {
      display: inline-flex;
      min-width: 0;
      max-width: 100%;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--pf-badge-border);
      border-radius: 999px;
      padding: 3px 8px;
      background: var(--pf-badge-bg);
      color: var(--pf-badge-text);
      font: inherit;
      font-size: 0.78em;
      font-weight: 800;
      line-height: 1.15;
      overflow-wrap: anywhere;
    }
  </style>
  <span class="badge" part="badge">
    <slot>Badge</slot>
  </span>
`);

const cardTemplate = documentSafeTemplate(`
  <style>
    :host {
      --pf-card-bg: var(--ds-surface-2);
      --pf-card-border: var(--ds-border-default);
      --pf-card-title: var(--ds-text-primary);
      --pf-card-text: var(--ds-text-secondary);
      display: block;
      min-width: 0;
    }

    :host([hidden]) {
      display: none;
    }

    :host([variant="raised"]) {
      --pf-card-bg: var(--ds-surface-3);
      --pf-card-border: var(--ds-border-strong);
    }

    .card {
      display: grid;
      gap: 10px;
      min-width: 0;
      border: 1px solid var(--pf-card-border);
      border-radius: 8px;
      padding: 14px;
      background: var(--pf-card-bg);
      color: var(--pf-card-text);
    }

    .eyebrow {
      color: var(--ds-text-muted);
      font-size: 0.72em;
      font-weight: 800;
      letter-spacing: 0;
      line-height: 1.2;
      text-transform: uppercase;
    }

    .title {
      color: var(--pf-card-title);
      font-weight: 800;
      line-height: 1.2;
    }

    .body {
      color: var(--pf-card-text);
      line-height: 1.45;
    }

    .footer {
      color: var(--ds-text-muted);
      line-height: 1.35;
    }

    [data-optional-slot][hidden] {
      display: none;
    }

    slot[name="eyebrow"],
    slot[name="title"],
    slot[name="footer"] {
      display: block;
    }
  </style>
  <article class="card" part="card">
    <div class="eyebrow" part="eyebrow" data-optional-slot hidden>
      <slot name="eyebrow"></slot>
    </div>
    <div class="title" part="title" data-optional-slot hidden>
      <slot name="title"></slot>
    </div>
    <div class="body" part="body">
      <slot></slot>
    </div>
    <div class="footer" part="footer" data-optional-slot hidden>
      <slot name="footer"></slot>
    </div>
  </article>
	`);

export class PfButtonElement extends HTMLElementBase {
  static get observedAttributes() {
    return ["disabled", "aria-label"] as const;
  }

  readonly #button: HTMLButtonElement | null = null;

  constructor() {
    super();

    if (!this.attachShadow || !buttonTemplate) {
      return;
    }

    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.append(buttonTemplate.content.cloneNode(true));
    this.#button = shadowRoot.querySelector("button");
  }

  connectedCallback() {
    this.#syncDisabled();
    this.#syncAccessibleName();
  }

  attributeChangedCallback() {
    this.#syncDisabled();
    this.#syncAccessibleName();
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean) {
    this.toggleAttribute("disabled", value);
  }

  get variant(): PfButtonVariant {
    return this.getAttribute("variant") === "secondary" ? "secondary" : "primary";
  }

  set variant(value: PfButtonVariant) {
    if (value === "secondary") {
      this.setAttribute("variant", value);
      return;
    }

    this.removeAttribute("variant");
  }

  click(): void {
    if (this.disabled) {
      return;
    }

    if (this.#button) {
      this.#button.click();
      return;
    }

    const click = HTMLElementBase.prototype.click;
    if (typeof click === "function") {
      click.call(this);
    }
  }

  focus(options?: FocusOptions): void {
    if (this.#button) {
      this.#button.focus(options);
      return;
    }

    const focus = HTMLElementBase.prototype.focus;
    if (typeof focus === "function") {
      focus.call(this, options);
    }
  }

  #syncDisabled() {
    if (!this.#button) {
      return;
    }

    this.#button.disabled = this.hasAttribute("disabled");
  }

  #syncAccessibleName() {
    if (!this.#button) {
      return;
    }

    const label = this.getAttribute("aria-label");
    if (label === null) {
      this.#button.removeAttribute("aria-label");
      return;
    }

    this.#button.setAttribute("aria-label", label);
  }
}

export class PfAlertElement extends HTMLElementBase {
  constructor() {
    super();

    if (!this.attachShadow || !alertTemplate) {
      return;
    }

    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.append(alertTemplate.content.cloneNode(true));
  }

  get status(): PfAlertStatus {
    const status = this.getAttribute("status");

    if (status === "danger" || status === "warning" || status === "success") {
      return status;
    }

    return "info";
  }

  set status(value: PfAlertStatus) {
    if (value === "info") {
      this.removeAttribute("status");
      return;
    }

    this.setAttribute("status", value);
  }

  get variant(): PfAlertVariant {
    return this.getAttribute("variant") === "solid" ? "solid" : "soft";
  }

  set variant(value: PfAlertVariant) {
    if (value === "solid") {
      this.setAttribute("variant", value);
      return;
    }

    this.removeAttribute("variant");
  }
}

export class PfBadgeElement extends HTMLElementBase {
  constructor() {
    super();

    if (!this.attachShadow || !badgeTemplate) {
      return;
    }

    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.append(badgeTemplate.content.cloneNode(true));
  }

  get status(): PfBadgeStatus {
    const status = this.getAttribute("status");

    if (status === "danger" || status === "warning" || status === "success") {
      return status;
    }

    return "info";
  }

  set status(value: PfBadgeStatus) {
    if (value === "info") {
      this.removeAttribute("status");
      return;
    }

    this.setAttribute("status", value);
  }

  get variant(): PfBadgeVariant {
    return this.getAttribute("variant") === "solid" ? "solid" : "soft";
  }

  set variant(value: PfBadgeVariant) {
    if (value === "solid") {
      this.setAttribute("variant", value);
      return;
    }

    this.removeAttribute("variant");
  }
}

export class PfCardElement extends HTMLElementBase {
  readonly #optionalSlots: HTMLSlotElement[] = [];

  constructor() {
    super();

    if (!this.attachShadow || !cardTemplate) {
      return;
    }

    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.append(cardTemplate.content.cloneNode(true));
    this.#optionalSlots = Array.from(
      shadowRoot.querySelectorAll<HTMLSlotElement>(
        'slot[name="eyebrow"], slot[name="title"], slot[name="footer"]',
      ),
    );

    for (const slot of this.#optionalSlots) {
      slot.addEventListener("slotchange", () => this.#syncOptionalSlots());
    }
  }

  connectedCallback() {
    this.#syncOptionalSlots();
  }

  get variant(): PfCardVariant {
    return this.getAttribute("variant") === "raised" ? "raised" : "default";
  }

  set variant(value: PfCardVariant) {
    if (value === "raised") {
      this.setAttribute("variant", value);
      return;
    }

    this.removeAttribute("variant");
  }

  #syncOptionalSlots() {
    for (const slot of this.#optionalSlots) {
      const wrapper = slot.parentElement;
      if (!wrapper) {
        continue;
      }

      const hasContent = slot.assignedNodes({ flatten: true }).some((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          return Boolean(node.textContent?.trim());
        }

        return true;
      });

      wrapper.hidden = !hasContent;
    }
  }
}

export function definePuzzleFactoryComponents(
  registry: CustomElementRegistry | undefined = globalThis.customElements,
): void {
  if (!registry) {
    return;
  }

  if (!registry.get("pf-button")) {
    registry.define("pf-button", PfButtonElement);
  }

  if (!registry.get("pf-alert")) {
    registry.define("pf-alert", PfAlertElement);
  }

  if (!registry.get("pf-badge")) {
    registry.define("pf-badge", PfBadgeElement);
  }

  if (!registry.get("pf-card")) {
    registry.define("pf-card", PfCardElement);
  }
}

function documentSafeTemplate(html: string): HTMLTemplateElement | null {
  if (!globalThis.document) {
    return null;
  }

  const template = globalThis.document.createElement("template");
  template.innerHTML = html;
  return template;
}
