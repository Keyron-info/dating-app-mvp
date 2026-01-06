import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { errorResponse, APIError } from "@/lib/utils/api";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      throw new APIError("UNAUTHORIZED", "認証が必要です", 401);
    }

    const supabase = createAdminClient();

    // ユーザー情報取得
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email")
      .eq("id", session.userId)
      .single();

    if (error || !user) {
      throw new APIError("NOT_FOUND", "ユーザーが見つかりません", 404);
    }

    // プロフィール完成度チェック
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_profile_complete")
      .eq("user_id", user.id)
      .single();

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          profileComplete: profile?.is_profile_complete ?? false,
        },
      },
    });
  } catch (error) {
    if (error instanceof APIError) {
      return errorResponse(error);
    }

    console.error("Get user error:", error);
    return errorResponse(
      new APIError("INTERNAL_ERROR", "サーバーエラーが発生しました", 500)
    );
  }
}

