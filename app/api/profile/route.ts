import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { profileSchema } from "@/lib/validation/schemas";
import { errorResponse, APIError } from "@/lib/utils/api";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      throw new APIError("UNAUTHORIZED", "認証が必要です", 401);
    }

    const supabase = createAdminClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", session.userId)
      .single();

    if (error || !profile) {
      throw new APIError("NOT_FOUND", "プロフィールが見つかりません", 404);
    }

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          id: profile.id,
          nickname: profile.nickname,
          age: profile.age,
          birthdate: profile.birthdate,
          gender: profile.gender,
          interestedIn: profile.interested_in,
          bio: profile.bio,
          photoUrls: profile.photo_urls,
          isComplete: profile.is_profile_complete,
        },
      },
    });
  } catch (error) {
    if (error instanceof APIError) {
      return errorResponse(error);
    }

    console.error("Get profile error:", error);
    return errorResponse(
      new APIError("INTERNAL_ERROR", "サーバーエラーが発生しました", 500)
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      throw new APIError("UNAUTHORIZED", "認証が必要です", 401);
    }

    const body = await request.json();
    const validated = profileSchema.parse(body);

    const supabase = createAdminClient();

    // 既存プロフィールチェック
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", session.userId)
      .single();

    if (existing) {
      throw new APIError(
        "CONFLICT",
        "プロフィールは既に作成されています",
        409
      );
    }

    // プロフィール作成
    const { data: profile, error } = await supabase
      .from("profiles")
      .insert({
        user_id: session.userId,
        nickname: validated.nickname,
        birthdate: validated.birthdate,
        gender: validated.gender,
        interested_in: validated.interestedIn,
        bio: validated.bio,
        photo_urls: validated.photoUrls,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw new APIError(
        "INTERNAL_ERROR",
        "プロフィール作成に失敗しました",
        500
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          profile: {
            id: profile.id,
            nickname: profile.nickname,
            age: profile.age,
            gender: profile.gender,
            interestedIn: profile.interested_in,
            bio: profile.bio,
            photoUrls: profile.photo_urls,
            isComplete: profile.is_profile_complete,
          },
          redirectTo: "/app/swipe",
        },
      },
      { status: 201 }
    );
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

    console.error("Create profile error:", error);
    return errorResponse(
      new APIError("INTERNAL_ERROR", "サーバーエラーが発生しました", 500)
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      throw new APIError("UNAUTHORIZED", "認証が必要です", 401);
    }

    const body = await request.json();
    const validated = profileSchema.parse(body);

    const supabase = createAdminClient();

    // プロフィール更新
    const { data: profile, error } = await supabase
      .from("profiles")
      .update({
        nickname: validated.nickname,
        birthdate: validated.birthdate,
        gender: validated.gender,
        interested_in: validated.interestedIn,
        bio: validated.bio,
        photo_urls: validated.photoUrls,
      })
      .eq("user_id", session.userId)
      .select()
      .single();

    if (error) {
      throw new APIError(
        "INTERNAL_ERROR",
        "プロフィール更新に失敗しました",
        500
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          id: profile.id,
          nickname: profile.nickname,
          age: profile.age,
          gender: profile.gender,
          interestedIn: profile.interested_in,
          bio: profile.bio,
          photoUrls: profile.photo_urls,
          isComplete: profile.is_profile_complete,
        },
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

    console.error("Update profile error:", error);
    return errorResponse(
      new APIError("INTERNAL_ERROR", "サーバーエラーが発生しました", 500)
    );
  }
}

