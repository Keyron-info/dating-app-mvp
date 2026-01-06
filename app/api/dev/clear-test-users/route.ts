import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { errorResponse, APIError } from "@/lib/utils/api";

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // 本番環境では無効化
    if (process.env.NODE_ENV === "production") {
      throw new APIError("FORBIDDEN", "このエンドポイントは本番環境では使用できません", 403);
    }

    const supabase = createAdminClient();

    // テストユーザーを削除（emailがtest.comで終わるユーザー）
    const { data: testUsers, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .like("email", "%@test.com");

    if (fetchError) {
      throw new APIError("INTERNAL_ERROR", "テストユーザーの取得に失敗しました", 500);
    }

    if (!testUsers || testUsers.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          message: "削除するテストユーザーが見つかりませんでした",
          deleted: 0,
        },
      });
    }

    const userIds = testUsers.map((u) => u.id);

    // プロフィール、スワイプ、マッチング、メッセージはCASCADEで自動削除される
    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .in("id", userIds);

    if (deleteError) {
      throw new APIError("INTERNAL_ERROR", "テストユーザーの削除に失敗しました", 500);
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `${testUsers.length}人のテストユーザーを削除しました`,
        deleted: testUsers.length,
      },
    });
  } catch (error) {
    if (error instanceof APIError) {
      return errorResponse(error);
    }

    console.error("Clear test users error:", error);
    return errorResponse(
      new APIError("INTERNAL_ERROR", "テストユーザー削除に失敗しました", 500)
    );
  }
}

