"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  profileSchema,
  type ProfileInput,
} from "@/lib/validation/schemas";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PhotoUpload } from "@/components/profile/PhotoUpload";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { Profile } from "@/types/profile";

interface ProfileFormProps {
  initialData?: Profile;
  mode?: "create" | "edit";
}

export function ProfileForm({ initialData, mode = "create" }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>(
    initialData?.photoUrls || []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData
      ? {
          nickname: initialData.nickname,
          birthdate: initialData.birthdate,
          gender: initialData.gender,
          interestedIn: initialData.interestedIn,
          bio: initialData.bio,
          photoUrls: initialData.photoUrls,
        }
      : undefined,
  });

  useEffect(() => {
    setValue("photoUrls", photoUrls);
  }, [photoUrls, setValue]);

  async function onSubmit(data: ProfileInput) {
    if (photoUrls.length < 1) {
      toast.error("写真を最低1枚アップロードしてください");
      return;
    }

    setIsLoading(true);
    try {
      const url = mode === "create" ? "/api/profile" : "/api/profile";
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          photoUrls,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.error?.details) {
          Object.values(result.error.details).forEach((msg: any) => {
            toast.error(String(msg));
          });
        } else {
          toast.error(result.error?.message || "保存に失敗しました");
        }
        return;
      }

      toast.success(
        mode === "create" ? "プロフィールを作成しました" : "プロフィールを更新しました"
      );
      if (mode === "create" && result.data.redirectTo) {
        router.push(result.data.redirectTo);
      } else {
        router.push("/app/profile");
      }
    } catch (error) {
      toast.error("通信エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">写真 *</label>
        <PhotoUpload photos={photoUrls} onChange={setPhotoUrls} />
        {errors.photoUrls && (
          <p className="mt-1 text-sm text-red-500">
            {errors.photoUrls.message}
          </p>
        )}
      </div>

      <Input
        {...register("nickname")}
        label="ニックネーム *"
        placeholder="2-20文字"
        error={errors.nickname?.message}
      />

      <div>
        <label className="block text-sm font-medium mb-1">生年月日 *</label>
        <input
          {...register("birthdate")}
          type="date"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.birthdate ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.birthdate && (
          <p className="mt-1 text-sm text-red-500">
            {errors.birthdate.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">性別 *</label>
        <div className="flex gap-4">
          {(["male", "female", "other"] as const).map((gender) => (
            <label key={gender} className="flex items-center gap-2">
              <input
                {...register("gender")}
                type="radio"
                value={gender}
                className="w-4 h-4"
              />
              <span>
                {gender === "male"
                  ? "男性"
                  : gender === "female"
                  ? "女性"
                  : "その他"}
              </span>
            </label>
          ))}
        </div>
        {errors.gender && (
          <p className="mt-1 text-sm text-red-500">{errors.gender.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          興味のある性別 *（複数選択可）
        </label>
        <div className="flex gap-4 flex-wrap">
          {(["male", "female", "other", "all"] as const).map((interest) => (
            <label key={interest} className="flex items-center gap-2">
              <input
                {...register("interestedIn")}
                type="checkbox"
                value={interest}
                className="w-4 h-4"
              />
              <span>
                {interest === "male"
                  ? "男性"
                  : interest === "female"
                  ? "女性"
                  : interest === "other"
                  ? "その他"
                  : "すべて"}
              </span>
            </label>
          ))}
        </div>
        {errors.interestedIn && (
          <p className="mt-1 text-sm text-red-500">
            {errors.interestedIn.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">自己紹介</label>
        <textarea
          {...register("bio")}
          rows={4}
          maxLength={500}
          placeholder="500文字以内"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.bio ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.bio && (
          <p className="mt-1 text-sm text-red-500">{errors.bio.message}</p>
        )}
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full">
        {mode === "create" ? "プロフィールを作成" : "プロフィールを更新"}
      </Button>
    </form>
  );
}

