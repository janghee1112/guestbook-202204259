import { ValidationError } from "./guestbook.ts";

/** 요청 본문을 JSON 객체로 읽는다. 형식이 틀리면 null. */
export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  const body = await request.json().catch(() => null);
  return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
}

export const badRequest = (error: string) => Response.json({ error }, { status: 400 });

/** ValidationError 는 400 으로, 나머지는 그대로 던진다. */
export function handleValidation(error: unknown): Response {
  if (error instanceof ValidationError) return badRequest(error.message);
  throw error;
}

export const OUTCOME_ERRORS = {
  not_found: { status: 404, error: "글을 찾을 수 없습니다. 이미 삭제되었을 수 있어요." },
  wrong_password: { status: 403, error: "비밀번호가 일치하지 않습니다." },
} as const;
