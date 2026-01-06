import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/schemas";
import { errorResponse, APIError } from "@/lib/utils/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = loginSchema.parse(body);

    // 管理者権限のクライアントを使用（RLSをバイパス）
    const supabase = createAdminClient();

    // ユーザー取得
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", validated.email)
      .single();

    if (userError || !user) {
      throw new APIError(
        "UNAUTHORIZED",
        "メールアドレスまたはパスワードが正しくありません",
        401
      );
    }

    // パスワード検証
    const isValid = await verifyPassword(validated.password, user.password_hash);

    if (!isValid) {
      throw new APIError(
        "UNAUTHORIZED",
        "メールアドレスまたはパスワードが正しくありません",
        401
      );
    }

    // アカウント有効性チェック
    if (!user.is_active) {
      throw new APIError("FORBIDDEN", "このアカウントは利用できません", 403);
    }

    // プロフィール完成度チェック
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_profile_complete")
      .eq("user_id", user.id)
      .single();

    const profileComplete = profile?.is_profile_complete ?? false;

    // セッション作成
    await createSession(user.id);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          profileComplete,
        },
        redirectTo: profileComplete ? "/app/swipe" : "/profile/create",
      },
    });
  } catch (error) {
    if (error instanceof APIError) {
      return errorResponse(error);
    }

    if (error instanceof Error && error.name === "ZodError") {
      return errorResponse(
        new APIError(
          "VALIDATION_ERROR",
          "入力内容に誤りがあります",
          400,
          error
        )
      );
    }

    console.error("Login error:", error);
    return errorResponse(
      new APIError("INTERNAL_ERROR", "サーバーエラーが発生しました", 500)
    );
  }
}

