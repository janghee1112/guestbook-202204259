import { badRequest, handleValidation, readJson } from "@/lib/api";
import { getDb } from "@/lib/db";
import { createEntry, listEntries } from "@/lib/guestbook";

export async function GET() {
  return Response.json(await listEntries(getDb()));
}

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return badRequest("요청 형식이 올바르지 않습니다.");
  try {
    const entry = await createEntry(getDb(), {
      name: body.name as string,
      message: body.message as string,
      password: body.password as string,
      emoji: body.emoji as string | undefined,
      color: body.color as string | undefined,
    });
    return Response.json(entry, { status: 201 });
  } catch (error) {
    return handleValidation(error);
  }
}
