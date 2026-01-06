import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { errorResponse, APIError } from "@/lib/utils/api";

export const dynamic = 'force-dynamic';

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
      throw new APIError("VALIDATION_ERROR", "自分自身にいいねはできません", 400);
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
      throw new APIError("CONFLICT", "既に評価済みのユーザーです", 409);
    }

    // スワイプ記録
    const { error: swipeError } = await supabase.from("swipes").insert({
      from_user_id: session.userId,
      to_user_id: targetUserId,
      action: "like",
    });

    if (swipeError) {
      throw new APIError("INTERNAL_ERROR", "いいねの記録に失敗しました", 500);
    }

    // 相互いいねチェック
    const { data: mutualLike } = await supabase
      .from("swipes")
      .select("id")
      .eq("from_user_id", targetUserId)
      .eq("to_user_id", session.userId)
      .eq("action", "like")
      .single();

    let matched = false;
    let matchId = null;
    let partner = null;

    if (mutualLike) {
      // マッチング作成（トリガーで自動作成されるが、念のため確認）
      const user1Id =
        session.userId < targetUserId ? session.userId : targetUserId;
      const user2Id =
        session.userId < targetUserId ? targetUserId : session.userId;

      const { data: match, error: matchError } = await supabase
        .from("matches")
        .select("id")
        .eq("user1_id", user1Id)
        .eq("user2_id", user2Id)
        .single();

      if (match) {
        matched = true;
        matchId = match.id;

        // パートナープロフィール取得
        const { data: partnerProfile } = await supabase
          .from("profiles")
          .select("user_id, nickname, age, photo_urls")
          .eq("user_id", targetUserId)
          .single();

        if (partnerProfile) {
          partner = {
            userId: partnerProfile.user_id,
            nickname: partnerProfile.nickname,
            age: partnerProfile.age,
            mainPhoto: partnerProfile.photo_urls?.[0] || null,
          };
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        matched,
        ...(matched && matchId && { matchId }),
        ...(matched && partner && { partner }),
      },
    });
  } catch (error) {
    if (error instanceof APIError) {
      return errorResponse(error);
    }

    console.error("Like error:", error);
    return errorResponse(
      new APIError("INTERNAL_ERROR", "サーバーエラーが発生しました", 500)
    );
  }
}

