import { expect, test } from "bun:test";
import { z } from "zod";
import { LEAD_STAGES } from "./lead-stages";

test("not interested is accepted as an additional stage without removing existing stages", () => {
  const schema = z.enum(LEAD_STAGES);
  expect(schema.parse("not_interested")).toBe("not_interested");
  expect(LEAD_STAGES).toEqual(["new", "contacted", "interested", "not_interested", "customer", "lost"]);
  expect(schema.safeParse("unknown").success).toBe(false);
});