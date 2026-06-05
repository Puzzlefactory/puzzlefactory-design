export const PUZZLEFACTORY_COMPONENT_TAG_NAMES = [
  "pf-button",
  "pf-alert",
] as const;

export type PuzzleFactoryComponentTagName = (typeof PUZZLEFACTORY_COMPONENT_TAG_NAMES)[number];
export type PfButtonVariant = "primary" | "secondary";
export type PfAlertStatus = "danger" | "warning" | "success" | "info";
export type PfAlertVariant = "soft" | "solid";

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
      outline: 3px solid color-mix(in oklch, var(--ds-primary-focus-ring), transparent 45%);
      outline-offset: 2px;
    }

    .button:disabled {
      color: var(--ds-text-muted);
      cursor: not-allowed;
      opacity: 0.56;
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

export class PfButtonElement extends HTMLElementBase {
  static get observedAttributes() {
    return ["disabled"] as const;
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
  }

  attributeChangedCallback() {
    this.#syncDisabled();
  }

  #syncDisabled() {
    if (!this.#button) {
      return;
    }

    this.#button.disabled = this.hasAttribute("disabled");
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
}

function documentSafeTemplate(html: string): HTMLTemplateElement | null {
  if (!globalThis.document) {
    return null;
  }

  const template = globalThis.document.createElement("template");
  template.innerHTML = html;
  return template;
}
