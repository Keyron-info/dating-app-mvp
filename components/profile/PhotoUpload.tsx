"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import toast from "react-hot-toast";

interface PhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export function PhotoUpload({
  photos,
  onChange,
  maxPhotos = 3,
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  async function handleFileSelect(index: number, file: File | null) {
    if (!file) return;

    // ファイル形式チェック
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("JPG、PNG、WEBP形式のみ対応しています");
      return;
    }

    // ファイルサイズチェック
    if (file.size > 10 * 1024 * 1024) {
      toast.error("ファイルサイズは10MB以下にしてください");
      return;
    }

    // ローカルプレビューを即座に表示
    const previewUrl = URL.createObjectURL(file);
    const newPhotos = [...photos];
    newPhotos[index] = previewUrl;
    onChange(newPhotos);

    setUploading(index);

    try {
      // クライアント側で画像圧縮
      let fileToUpload: File;
      try {
        fileToUpload = await imageCompression(file, {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: "image/jpeg",
        });
      } catch (compressionError) {
        console.error("Image compression error:", compressionError);
        // 圧縮に失敗した場合は元のファイルを使用
        fileToUpload = file;
      }

      const formData = new FormData();
      formData.append("file", fileToUpload);

      const res = await fetch("/api/profile/upload-photo", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        // エラー時はプレビューを削除
        const errorPhotos = [...photos];
        errorPhotos[index] = "";
        onChange(errorPhotos.filter((p, i) => i !== index || p));
        console.error("Upload error:", result);
        const errorMessage = result.error?.message || result.error?.code || "アップロードに失敗しました";
        toast.error(errorMessage);
        URL.revokeObjectURL(previewUrl);
        return;
      }

      // アップロード成功後、プレビューURLを実際のURLに置き換え
      const finalPhotos = [...photos];
      finalPhotos[index] = result.data.url;
      onChange(finalPhotos);
      URL.revokeObjectURL(previewUrl);
      toast.success("写真をアップロードしました");
    } catch (error) {
      // エラー時はプレビューを削除
      const errorPhotos = [...photos];
      errorPhotos[index] = "";
      onChange(errorPhotos.filter((p, i) => i !== index || p));
      toast.error("通信エラーが発生しました");
      URL.revokeObjectURL(previewUrl);
    } finally {
      setUploading(null);
    }
  }

  function handleDelete(index: number) {
    const newPhotos = photos.filter((_, i) => i !== index);
    onChange(newPhotos);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent, index: number) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(index, file);
    }
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: maxPhotos }).map((_, index) => (
        <div
          key={index}
          className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
        >
          {photos[index] ? (
            <>
              <div className="relative w-full h-full bg-gray-100">
                <Image
                  src={photos[index]}
                  alt={`写真${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  unoptimized={photos[index].startsWith('blob:')}
                />
                {uploading === index && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg z-20">
                    <div className="text-white text-sm">アップロード中...</div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (photos[index].startsWith('blob:')) {
                    URL.revokeObjectURL(photos[index]);
                  }
                  handleDelete(index);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 text-lg font-bold z-10 shadow-lg"
                disabled={uploading === index}
              >
                ×
              </button>
            </>
          ) : (
            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
              <input
                ref={(el) => (fileInputRefs.current[index] = el)}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(index, file);
                }}
              />
              {uploading === index ? (
                <span className="text-sm text-gray-500">アップロード中...</span>
              ) : (
                <>
                  <span className="text-2xl mb-1">+</span>
                  <span className="text-sm text-gray-500">
                    {index === 0 ? "必須" : "追加"}
                  </span>
                </>
              )}
            </label>
          )}
        </div>
      ))}
    </div>
  );
}

