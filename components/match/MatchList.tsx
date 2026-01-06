"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Match {
  matchId: string;
  matchedAt: string;
  partner: {
    userId: string;
    nickname: string;
    age: number;
    mainPhoto: string | null;
  } | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export function MatchList() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/matches");
      const result = await res.json();

      if (!res.ok) {
        console.error(result.error?.message || "マッチング取得に失敗しました");
        return;
      }

      setMatches(result.data.matches || []);
    } catch (error) {
      console.error("通信エラーが発生しました", error);
    } finally {
      setIsLoading(false);
    }
  }

  function formatTime(dateString: string | null): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "たった今";
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;
    return date.toLocaleDateString("ja-JP");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-6xl mb-4">💬</div>
        <p className="text-gray-600 mb-4">まだマッチングがありません</p>
        <Link
          href="/app/swipe"
          className="text-blue-600 hover:underline"
        >
          スワイプしてみる
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {matches.map((match) => (
        <button
          key={match.matchId}
          onClick={() => router.push(`/app/chat/${match.matchId}`)}
          className="w-full p-4 hover:bg-gray-50 flex items-center gap-4 text-left"
        >
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {match.partner?.mainPhoto ? (
              <Image
                src={match.partner.mainPhoto}
                alt={match.partner.nickname}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                👤
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-lg">
                {match.partner?.nickname || "不明"}, {match.partner?.age || ""}
              </h3>
              {match.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {match.unreadCount}
                </span>
              )}
            </div>
            <p className="text-gray-600 truncate">
              {match.lastMessage || "メッセージを送ってみましょう"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {formatTime(match.lastMessageAt || match.matchedAt)}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

