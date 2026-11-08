import { test } from "node:test";
import assert from "node:assert/strict";
import { TRIAL_DAYS, trialState, setupSchema } from "./setup-rules";
test("free trial lasts exactly seven days and ends at its expiry", () => {
  const start = Date.parse("2026-11-08T10:00:00Z");
  const expires = new Date(start + TRIAL_DAYS * 86400000).toISOString();
  assert.equal(expires, "2026-11-15T10:00:00.000Z");
  assert.deepEqual(trialState(expires, start), { active: true, daysLeft: 7 });
  assert.equal(trialState(expires, start + 7 * 86400000).active, false);
});
test("setup accepts three competitors and rejects four", () => {
  const setup = { website: "mine.com", name: "Mine", description: "Website design", country: "مصر", language: "العربية", dialect: "مصرية", questions: ["ما أفضل شركات تصميم المواقع؟"], competitors: [1,2,3].map(n => ({ name: `Brand ${n}`, url: `brand${n}.com` })) };
  assert.equal(setupSchema.safeParse(setup).success, true);
  assert.equal(setupSchema.safeParse({...setup, competitors: [...setup.competitors, {name:"Fourth",url:"fourth.com"}]}).success, false);
});