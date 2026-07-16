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

test("Kitchen Sink renders as the engineering diagnostic app", async () => {
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(server.baseUrl);
  await page.getByRole("heading", { name: "Color Engine Kitchen Sink" }).waitFor();
  await page.getByLabel("Kitchen sink navigation").getByRole("link", { name: "Components" }).click();
  await page.getByRole("heading", { name: "Component Proof" }).waitFor();

  assert.deepEqual(errors, []);
  await page.close();
});
