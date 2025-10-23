import { NextResponse } from "next/server";
import { authClient } from "../../../../../auth-client";

export async function POST(req: Request) {
  try {
    const { newPassword, token } = await req.json();

    if (!newPassword || !token) {
      return NextResponse.json(
        { error: "Missing password or token" },
        { status: 400 }
      );
    }

    const { error } = await authClient.resetPassword({
      newPassword,
      token,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to reset password" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Password reset successful" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
