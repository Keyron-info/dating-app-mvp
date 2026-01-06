import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/auth/session";
import { getSession } from "@/lib/auth/session";

export async function POST() {
  const session = await getSession();
  if (session) {
    await deleteSession();
  }

  return NextResponse.json({
    success: true,
    data: {
      message: "ログアウトしました",
      redirectTo: "/auth/login",
    },
  });
}

