import assert from "node:assert/strict";
import test, { after, before } from "node:test";
import { chromium } from "playwright";
import { startBuiltApp } from "../../../test-support/built-app-server.mjs";

let browser;
let server;

before(async () => {
  server = await startBuiltApp(new URL("../dist/", import.meta.url));
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  await server?.close();
});

test("Theme Author renders and clears publications when tenant identity changes", async () => {
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(`${server.baseUrl}/publishing`);
  await page.getByRole("heading", { name: "Theme Author" }).waitFor();
  await page.getByRole("button", { name: "Publish version" }).click();
  await page.getByText("Published immutable version v1 for tenant-default.").waitFor();
  assert.equal(await page.locator('[aria-label="Published theme versions"]').count(), 1);

  await page.getByLabel("Tenant ID").fill("another-tenant");
  await page.waitForFunction(() =>
    document.querySelector('[aria-label="Published theme versions"]') === null
  );

  assert.deepEqual(errors, []);
  await page.close();
});
