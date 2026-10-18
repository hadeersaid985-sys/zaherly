import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { LEAD_STAGES } from "./lead-stages";

test("not interested is accepted as an additional stage without removing existing stages", () => {
  const schema = z.enum(LEAD_STAGES);
  assert.equal(schema.parse("not_interested"), "not_interested");
  assert.deepEqual(LEAD_STAGES, ["new", "contacted", "interested", "not_interested", "customer", "lost"]);
  assert.equal(schema.safeParse("unknown").success, false);
});