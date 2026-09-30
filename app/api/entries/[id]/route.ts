import { badRequest, handleValidation, OUTCOME_ERRORS, readJson } from "@/lib/api";
import { getDb } from "@/lib/db";
import { deleteEntry, updateEntry } from "@/lib/guestbook";

/** 메시지 수정. body: { password, message } */
export async function PATCH(request: Request, ctx: RouteContext<"/api/entries/[id]">) {
  const { id } = await ctx.params;
  const body = await readJson(request);
  if (!body) return badRequest("요청 형식이 올바르지 않습니다.");
  try {
    const result = await updateEntry(getDb(), id, { password: body.password, message: body.message });
    if (result.outcome !== "ok") {
      const { status, error } = OUTCOME_ERRORS[result.outcome];
      return Response.json({ error }, { status });
    }
    return Response.json(result.entry);
  } catch (error) {
    return handleValidation(error);
  }
}

/** 글 삭제. body: { password } */
export async function DELETE(request: Request, ctx: RouteContext<"/api/entries/[id]">) {
  const { id } = await ctx.params;
  const body = await readJson(request);
  const outcome = await deleteEntry(getDb(), id, body?.password);
  if (outcome !== "ok") {
    const { status, error } = OUTCOME_ERRORS[outcome];
    return Response.json({ error }, { status });
  }
  return Response.json({ ok: true });
}
