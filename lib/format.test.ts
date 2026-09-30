import { test } from "node:test";
import assert from "node:assert/strict";
import { formatKst } from "./format.ts";

test("UTC 시각을 한국 시간(오전/오후 12시간제)으로 보여준다", () => {
  assert.equal(formatKst("2026-09-30T06:28:00.000Z"), "2026년 9월 30일 오후 03:28");
  assert.equal(formatKst("2026-09-30T15:05:00.000Z"), "2026년 10월 1일 오전 12:05");
  assert.equal(formatKst("2026-01-01T03:00:00.000Z"), "2026년 1월 1일 오후 12:00");
});
