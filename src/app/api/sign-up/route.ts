import { NextResponse } from "next/server";
import { authClient } from "../../../../auth-client";
import { signUpSchema } from "@/lib/zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const result = await authClient.signUp.email({
      name,
      email,
      password,
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
