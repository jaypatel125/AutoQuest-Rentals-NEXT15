import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
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

    const data = await auth.api.signInEmail({
      body: { email, password },
    });

    if (data.user) {
      return NextResponse.json(
        { message: "Signed in was successful" },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ error: "Sign-in failed" }, { status: 400 });
    }
  } catch (err) {
    console.error("Sign-in error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
