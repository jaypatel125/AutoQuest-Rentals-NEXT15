import { NextRequest } from "next/server";
import { auth } from "../../../../auth";
import { signInSchema } from "@/lib/zod";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = signInSchema.safeParse(body);

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.format() }), {
      status: 400,
    });
  }

  const { email, password } = parsed.data;

  return auth.api.signInEmail({
    body: { email, password },
  });
}
