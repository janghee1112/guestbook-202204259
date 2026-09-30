import type { Db } from "./db-types.ts";
import { MESSAGE_MAX, NAME_MAX, PASSWORD_MAX, PASSWORD_MIN } from "./entry-rules.ts";
import { hashPassword, verifyPassword } from "./password.ts";

/** 사용자가 고칠 수 있는 입력 오류. 메시지는 그대로 화면에 보여준다. */
export class ValidationError extends Error {
  name = "ValidationError";
}

/** 화면·API 로 나가는 방명록 글. 비밀번호 해시는 절대 포함하지 않는다. */
export type Entry = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
  updatedAt: string | null;
};

export type NewEntry = { name: string; message: string; password: string };

export type ChangeOutcome = "ok" | "not_found" | "wrong_password";

const LIST_LIMIT = 100;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PUBLIC_COLUMNS = "id, name, message, created_at, updated_at";

type EntryRow = {
  id: string;
  name: string;
  message: string;
  created_at: Date | string;
  updated_at: Date | string | null;
};

function toEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    name: row.name,
    message: row.message,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: row.updated_at === null ? null : new Date(row.updated_at).toISOString(),
  };
}

const LABELS = {
  name: { empty: "이름을 입력해 주세요.", long: `이름은 ${NAME_MAX}자 이하로 입력해 주세요.` },
  message: { empty: "메시지를 입력해 주세요.", long: `메시지는 ${MESSAGE_MAX}자 이하로 입력해 주세요.` },
};

function cleanText(value: unknown, field: keyof typeof LABELS, max: number): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new ValidationError(LABELS[field].empty);
  if (text.length > max) throw new ValidationError(LABELS[field].long);
  return text;
}

function checkPassword(value: unknown): string {
  if (typeof value !== "string" || value.length < PASSWORD_MIN || value.length > PASSWORD_MAX) {
    throw new ValidationError(`비밀번호는 ${PASSWORD_MIN}~${PASSWORD_MAX}자로 입력해 주세요.`);
  }
  return value;
}

/** 전체 글을 최신순으로 돌려준다(최대 100개). */
export async function listEntries(db: Db): Promise<Entry[]> {
  const rows = await db.query<EntryRow>(
    `select ${PUBLIC_COLUMNS} from entries order by created_at desc, id limit ${LIST_LIMIT}`,
  );
  return rows.map(toEntry);
}

/** 글을 남긴다. 비밀번호는 해시로만 저장한다. */
export async function createEntry(db: Db, input: NewEntry): Promise<Entry> {
  const name = cleanText(input.name, "name", NAME_MAX);
  const message = cleanText(input.message, "message", MESSAGE_MAX);
  const passwordHash = await hashPassword(checkPassword(input.password));
  const [row] = await db.query<EntryRow>(
    `insert into entries (name, message, password_hash) values ($1, $2, $3)
     returning ${PUBLIC_COLUMNS}`,
    [name, message, passwordHash],
  );
  return toEntry(row);
}

/** 작성자 확인: 글의 해시를 읽어 비밀번호를 대조한다. 맞으면 대조에 쓴 해시를 돌려준다. */
async function checkOwnership(
  db: Db,
  id: string,
  password: unknown,
): Promise<{ outcome: "not_found" | "wrong_password" } | { outcome: "ok"; hash: string }> {
  if (!UUID.test(id)) return { outcome: "not_found" };
  const [row] = await db.query<{ password_hash: string }>(
    `select password_hash from entries where id = $1`,
    [id],
  );
  if (!row) return { outcome: "not_found" };
  const ok = typeof password === "string" && (await verifyPassword(password, row.password_hash));
  return ok ? { outcome: "ok", hash: row.password_hash } : { outcome: "wrong_password" };
}

/** 비밀번호가 맞으면 메시지만 수정한다. 확인한 해시와 같은 행만 바꾼다(ADR-0001). */
export async function updateEntry(
  db: Db,
  id: string,
  input: { password: unknown; message: unknown },
): Promise<{ outcome: ChangeOutcome; entry?: Entry }> {
  const message = cleanText(input.message, "message", MESSAGE_MAX);
  const check = await checkOwnership(db, id, input.password);
  if (check.outcome !== "ok") return { outcome: check.outcome };
  const [row] = await db.query<EntryRow>(
    `update entries set message = $1, updated_at = now()
     where id = $2 and password_hash = $3
     returning ${PUBLIC_COLUMNS}`,
    [message, id, check.hash],
  );
  return row ? { outcome: "ok", entry: toEntry(row) } : { outcome: "not_found" };
}

/** 비밀번호가 맞으면 글을 삭제한다. */
export async function deleteEntry(db: Db, id: string, password: unknown): Promise<ChangeOutcome> {
  const check = await checkOwnership(db, id, password);
  if (check.outcome !== "ok") return check.outcome;
  const rows = await db.query<{ id: string }>(
    `delete from entries where id = $1 and password_hash = $2 returning id`,
    [id, check.hash],
  );
  return rows.length === 1 ? "ok" : "not_found";
}
