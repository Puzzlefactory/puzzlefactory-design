import assert from "node:assert/strict";
import test from "node:test";
import {
  PublicationRequestTracker,
  createPublicationIdentity,
} from "../src/publication-requests.ts";

test("identity changes invalidate delayed publication operations and list requests", () => {
  const tenantA = createPublicationIdentity("tenant-a", "default-theme");
  const tenantB = createPublicationIdentity("tenant-b", "default-theme");
  const tracker = new PublicationRequestTracker(tenantA);
  const delayedList = tracker.beginRequest();

  tracker.updateIdentity(tenantB);
  const activeList = tracker.beginRequest();

  assert.equal(tracker.isIdentityCurrent(tenantA), false);
  assert.equal(tracker.isIdentityCurrent(tenantB), true);
  assert.equal(tracker.isRequestCurrent(delayedList), false);
  assert.equal(tracker.isRequestCurrent(activeList), true);
});

test("request invalidation is scoped to the current request", () => {
  const tracker = new PublicationRequestTracker(
    createPublicationIdentity("tenant-a", "default-theme"),
  );
  const first = tracker.beginRequest();
  const second = tracker.beginRequest();

  tracker.invalidateRequest(first);
  assert.equal(tracker.isRequestCurrent(second), true);

  tracker.invalidateRequest(second);
  assert.equal(tracker.isRequestCurrent(second), false);
});

test("length-prefixed identities cannot collide at tenant/theme boundaries", () => {
  assert.notEqual(
    createPublicationIdentity("a", "bc"),
    createPublicationIdentity("ab", "c"),
  );
});
