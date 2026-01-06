import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { errorResponse, APIError } from "@/lib/utils/api";

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { matchId: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      throw new APIError("UNAUTHORIZED", "認証が必要です", 401);
    }

    const { matchId } = params;

    const supabase = createAdminClient();

    // マッチング取得
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (matchError || !match) {
      throw new APIError("NOT_FOUND", "マッチングが見つかりません", 404);
    }

    // 権限チェック
    if (
      match.user1_id !== session.userId &&
      match.user2_id !== session.userId
    ) {
      throw new APIError(
        "FORBIDDEN",
        "このマッチングにアクセスする権限がありません",
        403
      );
    }

    const partnerId =
      match.user1_id === session.userId ? match.user2_id : match.user1_id;

    // パートナープロフィール取得
    const { data: partnerProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", partnerId)
      .single();

    if (profileError || !partnerProfile) {
      throw new APIError("NOT_FOUND", "プロフィールが見つかりません", 404);
    }

    return NextResponse.json({
      success: true,
      data: {
        match: {
          matchId: match.id,
          matchedAt: match.created_at,
          partner: {
            userId: partnerProfile.user_id,
            nickname: partnerProfile.nickname,
            age: partnerProfile.age,
            gender: partnerProfile.gender,
            bio: partnerProfile.bio,
            photoUrls: partnerProfile.photo_urls || [],
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof APIError) {
      return errorResponse(error);
    }

    console.error("Get match error:", error);
    return errorResponse(
      new APIError("INTERNAL_ERROR", "サーバーエラーが発生しました", 500)
    );
  }
}

