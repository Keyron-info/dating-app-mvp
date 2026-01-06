import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { errorResponse, APIError } from "@/lib/utils/api";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      throw new APIError("UNAUTHORIZED", "認証が必要です", 401);
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (limit < 1 || limit > 20) {
      throw new APIError("VALIDATION_ERROR", "limitは1-20の範囲で指定してください", 400);
    }

    const supabase = createAdminClient();

    // 現在のユーザーのプロフィール取得
    const { data: currentProfile, error: profileError } = await supabase
      .from("profiles")
      .select("gender, interested_in")
      .eq("user_id", session.userId)
      .single();

    if (profileError || !currentProfile) {
      throw new APIError("NOT_FOUND", "プロフィールが見つかりません", 404);
    }

    // スワイプ済みユーザーID取得
    const { data: swipedUsers } = await supabase
      .from("swipes")
      .select("to_user_id")
      .eq("from_user_id", session.userId);

    const swipedUserIds = swipedUsers?.map((s) => s.to_user_id) || [];

    // 候補ユーザー取得
    let query = supabase
      .from("profiles")
      .select("user_id, nickname, age, gender, bio, photo_urls, interested_in")
      .neq("user_id", session.userId)
      .eq("is_active", true)
      .eq("is_profile_complete", true)
      .gte("age", 18);

    // スワイプ済み除外
    if (swipedUserIds.length > 0) {
      query = query.not("user_id", "in", `(${swipedUserIds.join(",")})`);
    }

    // 性別フィルタリング: 相手の性別が自分の興味対象に含まれる
    if (currentProfile.interested_in.length > 0) {
      if (!currentProfile.interested_in.includes("all")) {
        query = query.in("gender", currentProfile.interested_in);
      }
    }

    const { data: candidates, error } = await query
      .order("created_at", { ascending: false })
      .limit(limit * 3); // 多めに取得してフィルタリング

    if (error) {
      throw new APIError("INTERNAL_ERROR", "候補取得に失敗しました", 500);
    }

    // 自分の性別が相手の興味対象に含まれるかフィルタリング
    const filteredCandidates =
      candidates?.filter((candidate) => {
        // 相手のinterested_inに自分の性別が含まれる、または"all"が含まれる
        const candidateInterestedIn = candidate.interested_in || [];
        return (
          candidateInterestedIn.includes(currentProfile.gender) ||
          candidateInterestedIn.includes("all")
        );
      }) || [];

    // ランダムに並び替えてlimit件取得
    const shuffled = filteredCandidates.sort(() => Math.random() - 0.5);
    const limitedCandidates = shuffled.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: {
        candidates: limitedCandidates.map((c) => ({
          userId: c.user_id,
          nickname: c.nickname,
          age: c.age,
          gender: c.gender,
          bio: c.bio,
          photoUrls: c.photo_urls || [],
        })),
        hasMore: filteredCandidates.length > limit,
        total: filteredCandidates.length,
      },
    });
  } catch (error) {
    if (error instanceof APIError) {
      return errorResponse(error);
    }

    console.error("Get candidates error:", error);
    return errorResponse(
      new APIError("INTERNAL_ERROR", "サーバーエラーが発生しました", 500)
    );
  }
}

