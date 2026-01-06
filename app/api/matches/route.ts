import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { errorResponse, APIError } from "@/lib/utils/api";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      throw new APIError("UNAUTHORIZED", "認証が必要です", 401);
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const supabase = createAdminClient();

    // マッチング一覧取得
    const { data: matches, error: matchesError } = await supabase
      .from("matches")
      .select("*")
      .or(`user1_id.eq.${session.userId},user2_id.eq.${session.userId}`)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (matchesError) {
      throw new APIError("INTERNAL_ERROR", "マッチング取得に失敗しました", 500);
    }

    if (!matches || matches.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          matches: [],
          total: 0,
          hasMore: false,
        },
      });
    }

    // 各マッチングの詳細情報を取得
    const matchesWithDetails = await Promise.all(
      matches.map(async (match) => {
        const partnerId =
          match.user1_id === session.userId
            ? match.user2_id
            : match.user1_id;

        // パートナープロフィール取得
        const { data: partnerProfile } = await supabase
          .from("profiles")
          .select("user_id, nickname, age, photo_urls")
          .eq("user_id", partnerId)
          .single();

        // 最終メッセージ取得
        const { data: lastMessage } = await supabase
          .from("messages")
          .select("content, created_at")
          .eq("match_id", match.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // 未読数取得
        const { count: unreadCount } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("match_id", match.id)
          .eq("sender_id", partnerId)
          .is("read_at", null);

        return {
          matchId: match.id,
          matchedAt: match.created_at,
          partner: partnerProfile
            ? {
                userId: partnerProfile.user_id,
                nickname: partnerProfile.nickname,
                age: partnerProfile.age,
                mainPhoto: partnerProfile.photo_urls?.[0] || null,
              }
            : null,
          lastMessage: lastMessage?.content || null,
          lastMessageAt: lastMessage?.created_at || null,
          unreadCount: unreadCount || 0,
        };
      })
    );

    // 最終メッセージ日時でソート
    matchesWithDetails.sort((a, b) => {
      const aTime = a.lastMessageAt || a.matchedAt;
      const bTime = b.lastMessageAt || b.matchedAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    return NextResponse.json({
      success: true,
      data: {
        matches: matchesWithDetails,
        total: matchesWithDetails.length,
        hasMore: matchesWithDetails.length === limit,
      },
    });
  } catch (error) {
    if (error instanceof APIError) {
      return errorResponse(error);
    }

    console.error("Get matches error:", error);
    return errorResponse(
      new APIError("INTERNAL_ERROR", "サーバーエラーが発生しました", 500)
    );
  }
}

