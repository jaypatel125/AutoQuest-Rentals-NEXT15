import { NextResponse } from "next/server";
import { authClient } from "../../../../auth-client";
import { signInSchema } from "@/lib/zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signInSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const result = await authClient.signIn.email({
      email,
      password,
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: true, user: result.data.user },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Sign in error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
