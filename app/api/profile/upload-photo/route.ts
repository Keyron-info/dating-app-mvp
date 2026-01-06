import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { errorResponse, APIError } from "@/lib/utils/api";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      throw new APIError("UNAUTHORIZED", "認証が必要です", 401);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      throw new APIError("VALIDATION_ERROR", "ファイルが選択されていません", 400);
    }

    // ファイル形式チェック
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new APIError(
        "VALIDATION_ERROR",
        "対応していないファイル形式です（JPG/PNG/WEBPのみ）",
        400
      );
    }

    // ファイルサイズチェック
    if (file.size > MAX_FILE_SIZE) {
      throw new APIError(
        "VALIDATION_ERROR",
        "ファイルサイズは10MB以下にしてください",
        400
      );
    }

    // ファイル名生成
    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${session.userId}/${Date.now()}.${fileExt}`;

    // Supabase Storageにアップロード（サーバー側で直接アップロード）
    const supabase = createAdminClient();
    
    // FileをArrayBufferに変換してからアップロード
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    const { data, error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(fileName, uint8Array, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      throw new APIError(
        "INTERNAL_ERROR",
        `アップロードに失敗しました: ${uploadError.message || JSON.stringify(uploadError)}`,
        500
      );
    }

    if (!data) {
      throw new APIError(
        "INTERNAL_ERROR",
        "アップロードデータが取得できませんでした",
        500
      );
    }

    // 公開URLを取得
    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-photos").getPublicUrl(fileName);

    if (!publicUrl) {
      throw new APIError(
        "INTERNAL_ERROR",
        "公開URLの取得に失敗しました",
        500
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
      },
    });
  } catch (error) {
    if (error instanceof APIError) {
      return errorResponse(error);
    }

    console.error("Upload photo error:", error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : "アップロードに失敗しました";
    return errorResponse(
      new APIError("INTERNAL_ERROR", errorMessage, 500)
    );
  }
}

