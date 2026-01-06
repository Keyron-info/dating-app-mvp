import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { errorResponse, APIError } from "@/lib/utils/api";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      throw new APIError("UNAUTHORIZED", "認証が必要です", 401);
    }

    const body = await request.json();
    const { targetUserId } = body;

    if (!targetUserId) {
      throw new APIError("VALIDATION_ERROR", "targetUserIdが必要です", 400);
    }

    if (targetUserId === session.userId) {
      throw new APIError("VALIDATION_ERROR", "自分自身をスキップはできません", 400);
    }

    const supabase = createAdminClient();

    // 既にスワイプ済みかチェック
    const { data: existingSwipe } = await supabase
      .from("swipes")
      .select("id")
      .eq("from_user_id", session.userId)
      .eq("to_user_id", targetUserId)
      .single();

    if (existingSwipe) {
      // 既にスワイプ済みの場合は成功として扱う
      return NextResponse.json({
        success: true,
        data: {
          message: "スキップしました",
        },
      });
    }

    // スワイプ記録
    const { error: swipeError } = await supabase.from("swipes").insert({
      from_user_id: session.userId,
      to_user_id: targetUserId,
      action: "skip",
    });

    if (swipeError) {
      throw new APIError("INTERNAL_ERROR", "スキップの記録に失敗しました", 500);
    }

    return NextResponse.json({
      success: true,
      data: {
        message: "スキップしました",
      },
    });
  } catch (error) {
    if (error instanceof APIError) {
      return errorResponse(error);
    }

    console.error("Skip error:", error);
    return errorResponse(
      new APIError("INTERNAL_ERROR", "サーバーエラーが発生しました", 500)
    );
  }
}

