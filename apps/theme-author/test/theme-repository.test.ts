import assert from "node:assert/strict";
import test from "node:test";
import { COLOR_ENGINE_THEME_PRESETS } from "@puzzlefactory/color-engine";
import {
  THEME_SCHEMA_VERSION,
  createThemeArtifactBundle,
  createThemeComposition,
} from "@puzzlefactory/themes";
import {
  INITIAL_AUTHORED_ROLES,
  INITIAL_REGION_MAPPINGS,
} from "../src/authoring-model.ts";
import {
  ThemeRepositoryError,
  createBrowserLocalThemeRepository,
  type BrowserThemeStorage,
  type ThemeDraftContent,
} from "../src/theme-repository.ts";

const draft = {
  themeId: "tenant-default",
  themeName: "Tenant Default",
  themeInput: {
    ...COLOR_ENGINE_THEME_PRESETS.evergreen.input,
    namespace: "ds",
  },
  roles: INITIAL_AUTHORED_ROLES,
  regionMappings: INITIAL_REGION_MAPPINGS,
} satisfies ThemeDraftContent;

test("browser-local drafts use optimistic revisions and remain loadable", async () => {
  const storage = new MemoryStorage();
  const repository = createBrowserLocalThemeRepository(
    storage,
    () => new Date("2026-07-16T12:00:00.000Z"),
  );
  const first = await repository.saveDraft({
    tenantId: "tenant-a",
    expectedRevision: null,
    content: draft,
  });
  const second = await repository.saveDraft({
    tenantId: "tenant-a",
    expectedRevision: first.revision,
    content: { ...draft, themeName: "Updated Theme" },
  });

  assert.equal(first.revision, 1);
  assert.equal(second.revision, 2);
  assert.equal(second.updatedAt, "2026-07-16T12:00:00.000Z");
  assert.deepEqual(await repository.loadDraft("tenant-a", "tenant-default"), second);
});

test("stale draft writes fail without replacing the current draft", async () => {
  const repository = createBrowserLocalThemeRepository(new MemoryStorage());
  await repository.saveDraft({ tenantId: "tenant-a", expectedRevision: null, content: draft });

  await assert.rejects(
    repository.saveDraft({ tenantId: "tenant-a", expectedRevision: null, content: draft }),
    (error) => error instanceof ThemeRepositoryError && error.code === "DRAFT_CONFLICT",
  );
  assert.equal((await repository.loadDraft("tenant-a", "tenant-default"))?.revision, 1);
});

test("publications store the exact artifact bundle and versions are immutable", async () => {
  const storage = new MemoryStorage();
  const repository = createBrowserLocalThemeRepository(storage);
  const composition = createThemeComposition({
    schemaVersion: THEME_SCHEMA_VERSION,
    id: draft.themeId,
    name: draft.themeName,
    color: {
      ...draft.themeInput,
      customRoles: Object.fromEntries(draft.roles.map((role) => [
        role.id,
        {
          seed: role.lightSeed,
          darkSeed: role.darkSeed,
          seedPolicy: role.seedPolicy,
        },
      ])),
    },
    regions: {
      header: { roleId: "institution", treatment: "solid" },
      sidebar: { roleId: "navigation", treatment: "soft" },
      footer: { roleId: "footer", treatment: "solid" },
    },
  });
  const bundle = createThemeArtifactBundle(composition, {
    version: "v1",
    createdAt: "2026-07-16T12:30:00.000Z",
    createdBy: "test",
  });
  const publication = await repository.publishTheme({ tenantId: "tenant-a", bundle });

  assert.deepEqual(publication.bundle, bundle);
  assert.deepEqual(await repository.listPublications("tenant-a", draft.themeId), [publication]);
  await assert.rejects(
    repository.publishTheme({ tenantId: "tenant-a", bundle }),
    (error) => error instanceof ThemeRepositoryError && error.code === "VERSION_EXISTS",
  );
});

test("tenant namespaces isolate drafts and publications", async () => {
  const repository = createBrowserLocalThemeRepository(new MemoryStorage());
  await repository.saveDraft({ tenantId: "tenant-a", expectedRevision: null, content: draft });

  assert.equal(await repository.loadDraft("tenant-b", draft.themeId), null);
  assert.deepEqual(await repository.listPublications("tenant-b", draft.themeId), []);
});

class MemoryStorage implements BrowserThemeStorage {
  readonly #values = new Map<string, string>();

  get length(): number {
    return this.#values.size;
  }

  getItem(key: string): string | null {
    return this.#values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.#values.set(key, value);
  }

  key(index: number): string | null {
    return [...this.#values.keys()][index] ?? null;
  }
}
