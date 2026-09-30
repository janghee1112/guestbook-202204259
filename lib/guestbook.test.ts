import { test } from "node:test";
import assert from "node:assert/strict";
import { createTestDb } from "./test-db.ts";
import {
  createEntry,
  deleteEntry,
  listEntries,
  updateEntry,
  ValidationError,
  type NewEntry,
} from "./guestbook.ts";

const valid: NewEntry = { name: "장희", message: "안녕하세요!", password: "1234" };

test("글을 남기면 목록에 이름·메시지·작성 시각이 보인다", async () => {
  const db = await createTestDb();
  const entry = await createEntry(db, valid);
  const list = await listEntries(db);
  assert.equal(list.length, 1);
  assert.equal(list[0].id, entry.id);
  assert.equal(list[0].name, "장희");
  assert.equal(list[0].message, "안녕하세요!");
  assert.ok(!Number.isNaN(Date.parse(list[0].createdAt)));
  assert.equal(list[0].updatedAt, null);
});

test("목록은 최신 글이 먼저 온다", async () => {
  const db = await createTestDb();
  await createEntry(db, { ...valid, message: "첫 번째" });
  await createEntry(db, { ...valid, message: "두 번째" });
  assert.deepEqual((await listEntries(db)).map((e) => e.message), ["두 번째", "첫 번째"]);
});

test("비밀번호나 해시는 목록·작성 결과에 드러나지 않는다", async () => {
  const db = await createTestDb();
  const entry = await createEntry(db, { ...valid, password: "secret-pw" });
  const text = JSON.stringify([entry, await listEntries(db)]);
  assert.ok(!text.includes("secret-pw"));
  assert.ok(!text.toLowerCase().includes("password"));
  assert.ok(!text.toLowerCase().includes("hash"));
});

test("이름과 메시지의 앞뒤 공백을 정리한다", async () => {
  const db = await createTestDb();
  const entry = await createEntry(db, { ...valid, name: "  장희 ", message: "  반가워요  " });
  assert.equal(entry.name, "장희");
  assert.equal(entry.message, "반가워요");
});

const invalid: [string, NewEntry][] = [
  ["빈 이름", { ...valid, name: "   " }],
  ["21자 이름", { ...valid, name: "가".repeat(21) }],
  ["빈 메시지", { ...valid, message: " " }],
  ["501자 메시지", { ...valid, message: "a".repeat(501) }],
  ["3자 비밀번호", { ...valid, password: "123" }],
];
for (const [name, input] of invalid) {
  test(`${name}이면 글을 남기지 않는다`, async () => {
    const db = await createTestDb();
    await assert.rejects(createEntry(db, input), ValidationError);
    assert.equal((await listEntries(db)).length, 0);
  });
}

test("비밀번호가 맞으면 메시지를 수정하고 수정 시각이 생긴다", async () => {
  const db = await createTestDb();
  const entry = await createEntry(db, valid);
  const result = await updateEntry(db, entry.id, { password: "1234", message: " 고친 메시지 " });
  assert.equal(result.outcome, "ok");
  const [after] = await listEntries(db);
  assert.equal(after.message, "고친 메시지");
  assert.equal(after.name, "장희");
  assert.ok(after.updatedAt);
});

test("비밀번호가 틀리면 수정을 거부하고 메시지는 그대로다", async () => {
  const db = await createTestDb();
  const entry = await createEntry(db, valid);
  const result = await updateEntry(db, entry.id, { password: "0000", message: "해킹" });
  assert.equal(result.outcome, "wrong_password");
  assert.equal((await listEntries(db))[0].message, "안녕하세요!");
});

test("수정할 메시지가 비어 있으면 ValidationError", async () => {
  const db = await createTestDb();
  const entry = await createEntry(db, valid);
  await assert.rejects(updateEntry(db, entry.id, { password: "1234", message: "  " }), ValidationError);
});

test("없는 글이나 잘못된 id 수정은 not_found", async () => {
  const db = await createTestDb();
  const missing = "00000000-0000-4000-8000-000000000000";
  assert.equal((await updateEntry(db, missing, { password: "1234", message: "x" })).outcome, "not_found");
  assert.equal((await updateEntry(db, "nope", { password: "1234", message: "x" })).outcome, "not_found");
});

test("비밀번호가 맞으면 삭제하고 다른 글은 남는다", async () => {
  const db = await createTestDb();
  const keep = await createEntry(db, { ...valid, message: "남길 글" });
  const remove = await createEntry(db, { ...valid, message: "지울 글", password: "abcd" });
  assert.equal(await deleteEntry(db, remove.id, "abcd"), "ok");
  assert.deepEqual((await listEntries(db)).map((e) => e.id), [keep.id]);
});

test("비밀번호가 틀리면 삭제를 거부하고 글은 남는다", async () => {
  const db = await createTestDb();
  const entry = await createEntry(db, valid);
  assert.equal(await deleteEntry(db, entry.id, "wrong"), "wrong_password");
  assert.equal(await deleteEntry(db, entry.id, ""), "wrong_password");
  assert.equal((await listEntries(db)).length, 1);
});

test("없는 글 삭제는 not_found", async () => {
  const db = await createTestDb();
  assert.equal(await deleteEntry(db, "00000000-0000-4000-8000-000000000000", "1234"), "not_found");
  assert.equal(await deleteEntry(db, "nope", "1234"), "not_found");
});

test("같은 비밀번호라도 글마다 다른 해시로 저장되어 서로의 글을 건드리지 못한다", async () => {
  const db = await createTestDb();
  const a = await createEntry(db, { ...valid, password: "same" });
  const b = await createEntry(db, { ...valid, password: "other" });
  assert.equal(await deleteEntry(db, b.id, "same"), "wrong_password");
  assert.equal(await deleteEntry(db, a.id, "same"), "ok");
  const rows = await db.query<{ password_hash: string }>("select password_hash from entries");
  assert.equal(rows.length, 1);
  assert.ok(!rows[0].password_hash.includes("other"));
});
