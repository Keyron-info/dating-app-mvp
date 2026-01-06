"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { TabNavigation } from "@/components/layout/TabNavigation";
import type { Profile } from "@/types/profile";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/profile");
      const result = await res.json();

      if (!res.ok) {
        if (result.error?.code === "NOT_FOUND") {
          router.push("/profile/create");
          return;
        }
        toast.error(result.error?.message || "プロフィールの取得に失敗しました");
        return;
      }

      setProfile(result.data.profile);
    } catch (error) {
      toast.error("通信エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function handleLogout() {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const result = await res.json();

      if (res.ok) {
        router.push("/auth/login");
      } else {
        toast.error(result.error?.message || "ログアウトに失敗しました");
      }
    } catch (error) {
      toast.error("通信エラーが発生しました");
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-6 mb-4">
          <h1 className="text-2xl font-bold mb-6">マイページ</h1>

          {/* 写真ギャラリー */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {profile.photoUrls.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-200">
                <Image
                  src={url}
                  alt={`写真${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/* プロフィール情報 */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">
              {profile.nickname}, {profile.age}
            </h2>
            {profile.bio && (
              <p className="text-gray-600 whitespace-pre-wrap">{profile.bio}</p>
            )}
          </div>

          <Button
            onClick={() => router.push("/profile/edit")}
            className="w-full mb-4"
          >
            プロフィールを編集
          </Button>
        </div>

        {/* メニュー */}
        <div className="bg-white divide-y">
          <button
            onClick={() => router.push("/terms")}
            className="w-full p-4 text-left hover:bg-gray-50"
          >
            利用規約
          </button>
          <button
            onClick={() => router.push("/privacy")}
            className="w-full p-4 text-left hover:bg-gray-50"
          >
            プライバシーポリシー
          </button>
          <button
            onClick={handleLogout}
            className="w-full p-4 text-left text-red-600 hover:bg-gray-50"
          >
            ログアウト
          </button>
        </div>
      </div>

      <TabNavigation />
    </div>
  );
}

