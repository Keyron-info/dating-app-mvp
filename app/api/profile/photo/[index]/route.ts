import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { createClient } from "@/lib/supabase/client";
import { deleteProfilePhoto } from "@/lib/utils/image";
import { errorResponse, APIError } from "@/lib/utils/api";

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: Request,
  { params }: { params: { index: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      throw new APIError("UNAUTHORIZED", "認証が必要です", 401);
    }

    const index = parseInt(params.index);
    if (isNaN(index) || index < 0 || index > 2) {
      throw new APIError("VALIDATION_ERROR", "無効なインデックスです", 400);
    }

    const supabase = createAdminClient();

    // プロフィール取得
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("photo_urls")
      .eq("user_id", session.userId)
      .single();

    if (profileError || !profile) {
      throw new APIError("NOT_FOUND", "プロフィールが見つかりません", 404);
    }

    if (!profile.photo_urls || index >= profile.photo_urls.length) {
      throw new APIError("VALIDATION_ERROR", "写真が見つかりません", 404);
    }

    // 写真削除（Storageから）
    const photoUrl = profile.photo_urls[index];
    await deleteProfilePhoto(photoUrl);

    // 配列から削除（型を明示）
    const photoUrls: string[] = profile.photo_urls || [];
    const newPhotoUrls = photoUrls.filter(
      (_url: string, i: number) => i !== index
    );

    // 最低1枚必要
    if (newPhotoUrls.length < 1) {
      throw new APIError(
        "VALIDATION_ERROR",
        "写真は最低1枚必要です",
        400
      );
    }

    // プロフィール更新
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({ photo_urls: newPhotoUrls })
      .eq("user_id", session.userId)
      .select()
      .single();

    if (updateError) {
      throw new APIError(
        "INTERNAL_ERROR",
        "プロフィール更新に失敗しました",
        500
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: "写真を削除しました",
        photoUrls: updatedProfile.photo_urls,
      },
    });
  } catch (error) {
    if (error instanceof APIError) {
      return errorResponse(error);
    }

    console.error("Delete photo error:", error);
    return errorResponse(
      new APIError("INTERNAL_ERROR", "削除に失敗しました", 500)
    );
  }
}

