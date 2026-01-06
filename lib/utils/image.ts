import { createClient } from "@/lib/supabase/client";
import imageCompression from "browser-image-compression";

export async function uploadProfilePhoto(
  file: File,
  userId: string
): Promise<string> {
  try {
    // 1. 画像圧縮
    let compressed: File;
    try {
      compressed = await imageCompression(file, {
        maxSizeMB: 2, // 圧縮後の最大サイズを2MBに（元が10MBなので）
        maxWidthOrHeight: 1920, // より高解像度を許可
        useWebWorker: true,
        fileType: "image/jpeg",
      });
    } catch (compressionError) {
      console.error("Image compression error:", compressionError);
      // 圧縮に失敗した場合は元のファイルを使用
      compressed = file;
    }

    // 2. ファイル名生成
    const fileExt = compressed.name.split(".").pop() || "jpg";
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    // 3. Supabase Storageにアップロード
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from("profile-photos")
      .upload(fileName, compressed, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw new Error(`アップロードエラー: ${error.message || JSON.stringify(error)}`);
    }

    if (!data) {
      throw new Error("アップロードデータが取得できませんでした");
    }

    // 4. 公開URLを取得
    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-photos").getPublicUrl(fileName);

    if (!publicUrl) {
      throw new Error("公開URLの取得に失敗しました");
    }

    return publicUrl;
  } catch (error) {
    console.error("uploadProfilePhoto error:", error);
    throw error;
  }
}

export async function deleteProfilePhoto(url: string): Promise<void> {
  const supabase = createClient();
  const path = url.split("/profile-photos/")[1];

  const { error } = await supabase.storage
    .from("profile-photos")
    .remove([path]);

  if (error) throw error;
}

