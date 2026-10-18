import { test } from "node:test";
import assert from "node:assert/strict";
import { competitorSchema, contentCanExport, mentionCount, PRIORITIES, sameSiteReports, scoreDelta, taskSuggestions } from "./growth-rules";

test("customer may add three competitors but not four", () => {
  const competitors = [1,2,3,4].map(n => ({ name: `Brand ${n}`, url: `https://brand${n}.com` }));
  assert.equal(competitorSchema.safeParse({site:"mine.com", competitors:competitors.slice(0,3)}).success,true);
  assert.equal(competitorSchema.safeParse({site:"mine.com", competitors}).success,false);
});
test("duplicate and own sites cannot be competitors", () => {
  assert.equal(competitorSchema.safeParse({site:"mine.com", competitors:[{name:"Mine",url:"https://www.mine.com"}]}).success,false);
});
test("priorities retain urgent important and later and completion suggestions", () => {
  assert.deepEqual(PRIORITIES,["urgent","important","later"]);
  assert.deepEqual(taskSuggestions({actionPlan:{days30:["Fix FAQ"],days60:["Write guide"],days90:["Add case"]}}).map(t=>t.priority),PRIORITIES);
});
test("trend compares completed reports only for the same site", () => {
  const rows=[{website_url:"other.com",status:"completed",created_at:"2026-10-18"},{website_url:"www.mine.com",status:"completed",created_at:"2026-10-17"},{website_url:"mine.com",status:"failed",created_at:"2026-10-18"}];
  assert.equal(sameSiteReports(rows,"https://mine.com").length,1);
  assert.equal(scoreDelta(74,61),13); assert.equal(scoreDelta(61,74),-13); assert.equal(scoreDelta(null,61),null);
});
test("content must be approved before export", () => {
  assert.equal(contentCanExport("draft"),false); assert.equal(contentCanExport("changes_requested"),false); assert.equal(contentCanExport("approved"),true);
});
test("mentions come from answers or actual citations, not partial brand strings", () => {
  assert.equal(mentionCount("No brands found",[],"Acme","acme.com"),0);
  assert.equal(mentionCount("Acme and Acme",[],"Acme","acme.com"),2);
  assert.equal(mentionCount("Acmeology",[],"Acme","acme.com"),0);
  assert.equal(mentionCount("See source",["https://acme.com/about"],"Acme","acme.com"),1);
});