import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import test, { after, before } from "node:test";
import { chromium } from "playwright";

const componentSource = await readFile(new URL("../dist/index.js", import.meta.url), "utf8");

let browser;
let server;
let baseUrl;

before(async () => {
  server = createServer((request, response) => {
    if (request.url === "/components.js") {
      response.writeHead(200, { "content-type": "text/javascript; charset=utf-8" });
      response.end(componentSource);
      return;
    }

    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end("<!doctype html><html><body></body></html>");
  });

  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  assert.ok(address && typeof address === "object");
  baseUrl = `http://127.0.0.1:${address.port}`;
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  await new Promise((resolve, reject) => {
    server?.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
});

async function createComponentPage() {
  const page = await browser.newPage();
  await page.goto(baseUrl);
  await page.addScriptTag({
    content: `
      import { definePuzzleFactoryComponents } from "/components.js";
      definePuzzleFactoryComponents();
      window.__componentsDefined = true;
    `,
    type: "module",
  });
  await page.waitForFunction(() => window.__componentsDefined === true);
  return page;
}

test("custom elements register in a browser CustomElementRegistry", async () => {
  const page = await createComponentPage();

  const result = await page.evaluate(() => ({
    buttonName: customElements.get("pf-button")?.name,
    alertName: customElements.get("pf-alert")?.name,
    badgeName: customElements.get("pf-badge")?.name,
    cardName: customElements.get("pf-card")?.name,
  }));

  assert.equal(result.buttonName, "PfButtonElement");
  assert.equal(result.alertName, "PfAlertElement");
  assert.equal(result.badgeName, "PfBadgeElement");
  assert.equal(result.cardName, "PfCardElement");
  await page.close();
});

test("pf-button reflects disabled state to the attribute and internal native button", async () => {
  const page = await createComponentPage();

  const result = await page.evaluate(() => {
    const button = document.createElement("pf-button");
    button.textContent = "Save";
    document.body.append(button);
    const nativeButton = button.shadowRoot.querySelector("button");

    const initial = {
      property: button.disabled,
      attribute: button.hasAttribute("disabled"),
      native: nativeButton.disabled,
    };

    button.disabled = true;
    const propertySet = {
      property: button.disabled,
      attribute: button.hasAttribute("disabled"),
      native: nativeButton.disabled,
    };

    button.disabled = false;
    button.setAttribute("disabled", "");
    const attributeSet = {
      property: button.disabled,
      attribute: button.hasAttribute("disabled"),
      native: nativeButton.disabled,
    };

    return { initial, propertySet, attributeSet };
  });

  assert.deepEqual(result.initial, { property: false, attribute: false, native: false });
  assert.deepEqual(result.propertySet, { property: true, attribute: true, native: true });
  assert.deepEqual(result.attributeSet, { property: true, attribute: true, native: true });
  await page.close();
});

test("pf-button reflects variant state to the attribute", async () => {
  const page = await createComponentPage();

  const result = await page.evaluate(() => {
    const button = document.createElement("pf-button");
    document.body.append(button);

    const initial = {
      property: button.variant,
      attribute: button.getAttribute("variant"),
    };

    button.variant = "secondary";
    const secondary = {
      property: button.variant,
      attribute: button.getAttribute("variant"),
    };

    button.variant = "primary";
    const primary = {
      property: button.variant,
      attribute: button.getAttribute("variant"),
    };

    return { initial, secondary, primary };
  });

  assert.deepEqual(result.initial, { property: "primary", attribute: null });
  assert.deepEqual(result.secondary, { property: "secondary", attribute: "secondary" });
  assert.deepEqual(result.primary, { property: "primary", attribute: null });
  await page.close();
});

test("pf-button click delegates through composed native click only when enabled", async () => {
  const page = await createComponentPage();

  const result = await page.evaluate(() => {
    const button = document.createElement("pf-button");
    button.textContent = "Save";
    document.body.append(button);
    const events = [];

    button.addEventListener("click", (event) => {
      events.push({
        composed: event.composed,
        targetIsHost: event.target === button,
      });
    });

    button.click();
    button.disabled = true;
    button.click();

    return events;
  });

  assert.deepEqual(result, [{ composed: true, targetIsHost: true }]);
  await page.close();
});

test("pf-button focus delegates to the internal native button", async () => {
  const page = await createComponentPage();

  const result = await page.evaluate(() => {
    const button = document.createElement("pf-button");
    button.textContent = "Save";
    document.body.append(button);
    const nativeButton = button.shadowRoot.querySelector("button");

    button.focus();

    return {
      documentActiveIsHost: document.activeElement === button,
      shadowActiveIsButton: button.shadowRoot.activeElement === nativeButton,
    };
  });

  assert.deepEqual(result, {
    documentActiveIsHost: true,
    shadowActiveIsButton: true,
  });
  await page.close();
});

test("pf-button slotted text reaches the internal native button label path", async () => {
  const page = await createComponentPage();

  const result = await page.evaluate(() => {
    const button = document.createElement("pf-button");
    button.textContent = "Save changes";
    document.body.append(button);
    const nativeButton = button.shadowRoot.querySelector("button");
    const slot = nativeButton.querySelector("slot");

    return {
      fallbackText: nativeButton.textContent.trim(),
      assignedText: slot.assignedNodes({ flatten: true })[0]?.textContent,
    };
  });

  assert.equal(result.fallbackText, "Button");
  assert.equal(result.assignedText, "Save changes");
  await page.close();
});

test("pf-alert reflects status and variant state to attributes", async () => {
  const page = await createComponentPage();

  const result = await page.evaluate(() => {
    const alert = document.createElement("pf-alert");
    document.body.append(alert);

    const initial = {
      status: alert.status,
      statusAttribute: alert.getAttribute("status"),
      variant: alert.variant,
      variantAttribute: alert.getAttribute("variant"),
    };

    alert.status = "danger";
    alert.variant = "solid";
    const explicit = {
      status: alert.status,
      statusAttribute: alert.getAttribute("status"),
      variant: alert.variant,
      variantAttribute: alert.getAttribute("variant"),
    };

    alert.status = "info";
    alert.variant = "soft";
    const defaults = {
      status: alert.status,
      statusAttribute: alert.getAttribute("status"),
      variant: alert.variant,
      variantAttribute: alert.getAttribute("variant"),
    };

    return { initial, explicit, defaults };
  });

  assert.deepEqual(result.initial, {
    status: "info",
    statusAttribute: null,
    variant: "soft",
    variantAttribute: null,
  });
  assert.deepEqual(result.explicit, {
    status: "danger",
    statusAttribute: "danger",
    variant: "solid",
    variantAttribute: "solid",
  });
  assert.deepEqual(result.defaults, {
    status: "info",
    statusAttribute: null,
    variant: "soft",
    variantAttribute: null,
  });
  await page.close();
});

test("pf-alert renders a status region and projects title slot content", async () => {
  const page = await createComponentPage();

  const result = await page.evaluate(() => {
    const alert = document.createElement("pf-alert");
    alert.textContent = "Theme CSS loaded.";

    const title = document.createElement("span");
    title.slot = "title";
    title.textContent = "Saved";
    alert.prepend(title);

    document.body.append(alert);
    const region = alert.shadowRoot.querySelector('[role="status"]');
    const titleSlot = region.querySelector('slot[name="title"]');
    const bodySlot = region.querySelector(".body slot");

    return {
      role: region.getAttribute("role"),
      titleText: titleSlot.assignedNodes({ flatten: true })[0]?.textContent,
      bodyText: bodySlot.assignedNodes({ flatten: true })[0]?.textContent,
    };
  });

  assert.deepEqual(result, {
    role: "status",
    titleText: "Saved",
    bodyText: "Theme CSS loaded.",
  });
  await page.close();
});

test("pf-badge reflects status and variant state to attributes", async () => {
  const page = await createComponentPage();

  const result = await page.evaluate(() => {
    const badge = document.createElement("pf-badge");
    document.body.append(badge);

    const initial = {
      status: badge.status,
      statusAttribute: badge.getAttribute("status"),
      variant: badge.variant,
      variantAttribute: badge.getAttribute("variant"),
    };

    badge.status = "warning";
    badge.variant = "solid";
    const explicit = {
      status: badge.status,
      statusAttribute: badge.getAttribute("status"),
      variant: badge.variant,
      variantAttribute: badge.getAttribute("variant"),
    };

    badge.status = "info";
    badge.variant = "soft";
    const defaults = {
      status: badge.status,
      statusAttribute: badge.getAttribute("status"),
      variant: badge.variant,
      variantAttribute: badge.getAttribute("variant"),
    };

    return { initial, explicit, defaults };
  });

  assert.deepEqual(result.initial, {
    status: "info",
    statusAttribute: null,
    variant: "soft",
    variantAttribute: null,
  });
  assert.deepEqual(result.explicit, {
    status: "warning",
    statusAttribute: "warning",
    variant: "solid",
    variantAttribute: "solid",
  });
  assert.deepEqual(result.defaults, {
    status: "info",
    statusAttribute: null,
    variant: "soft",
    variantAttribute: null,
  });
  await page.close();
});

test("pf-badge renders slotted label content", async () => {
  const page = await createComponentPage();

  const result = await page.evaluate(() => {
    const badge = document.createElement("pf-badge");
    badge.textContent = "In review";
    document.body.append(badge);
    const badgePart = badge.shadowRoot.querySelector('[part="badge"]');
    const slot = badgePart.querySelector("slot");

    return {
      fallbackText: badgePart.textContent.trim(),
      assignedText: slot.assignedNodes({ flatten: true })[0]?.textContent,
    };
  });

  assert.equal(result.fallbackText, "Badge");
  assert.equal(result.assignedText, "In review");
  await page.close();
});

test("pf-card reflects variant state and projects composition slots", async () => {
  const page = await createComponentPage();

  const result = await page.evaluate(() => {
    const card = document.createElement("pf-card");
    const eyebrow = document.createElement("span");
    const title = document.createElement("span");
    const footer = document.createElement("span");

    eyebrow.slot = "eyebrow";
    eyebrow.textContent = "System";
    title.slot = "title";
    title.textContent = "Token-backed card";
    footer.slot = "footer";
    footer.textContent = "Generated CSS only";
    card.append(eyebrow, title, "Surface, border, and text semantics.", footer);
    document.body.append(card);

    const initial = {
      variant: card.variant,
      variantAttribute: card.getAttribute("variant"),
    };

    card.variant = "raised";
    const raised = {
      variant: card.variant,
      variantAttribute: card.getAttribute("variant"),
    };

    card.variant = "default";
    const defaults = {
      variant: card.variant,
      variantAttribute: card.getAttribute("variant"),
    };

    const root = card.shadowRoot.querySelector('[part="card"]');
    const eyebrowSlot = root.querySelector('slot[name="eyebrow"]');
    const titleSlot = root.querySelector('slot[name="title"]');
    const bodySlot = root.querySelector(".body slot");
    const footerSlot = root.querySelector('slot[name="footer"]');

    return {
      initial,
      raised,
      defaults,
      eyebrowText: eyebrowSlot.assignedNodes({ flatten: true })[0]?.textContent,
      titleText: titleSlot.assignedNodes({ flatten: true })[0]?.textContent,
      bodyText: bodySlot.assignedNodes({ flatten: true })[0]?.textContent,
      footerText: footerSlot.assignedNodes({ flatten: true })[0]?.textContent,
    };
  });

  assert.deepEqual(result.initial, { variant: "default", variantAttribute: null });
  assert.deepEqual(result.raised, { variant: "raised", variantAttribute: "raised" });
  assert.deepEqual(result.defaults, { variant: "default", variantAttribute: null });
  assert.equal(result.eyebrowText, "System");
  assert.equal(result.titleText, "Token-backed card");
  assert.equal(result.bodyText, "Surface, border, and text semantics.");
  assert.equal(result.footerText, "Generated CSS only");
  await page.close();
});

test("pf-card hides optional composition rows when slots are empty", async () => {
  const page = await createComponentPage();

  const result = await page.evaluate(async () => {
    const card = document.createElement("pf-card");
    card.append("Body only");
    document.body.append(card);
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const root = card.shadowRoot.querySelector('[part="card"]');
    const eyebrow = root.querySelector('[part="eyebrow"]');
    const title = root.querySelector('[part="title"]');
    const footer = root.querySelector('[part="footer"]');
    const bodySlot = root.querySelector(".body slot");
    const bodyText = bodySlot
      .assignedNodes({ flatten: true })
      .map((node) => node.textContent?.trim())
      .find(Boolean);

    return {
      bodyText,
      eyebrowHidden: eyebrow.hidden,
      titleHidden: title.hidden,
      footerHidden: footer.hidden,
    };
  });

  assert.equal(result.bodyText, "Body only");
  assert.equal(result.eyebrowHidden, true);
  assert.equal(result.titleHidden, true);
  assert.equal(result.footerHidden, true);
  await page.close();
});
