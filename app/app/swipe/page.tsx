"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SwipeCard } from "@/components/swipe/SwipeCard";
import { MatchModal } from "@/components/swipe/MatchModal";
import { Button } from "@/components/ui/Button";
import { TabNavigation } from "@/components/layout/TabNavigation";
import toast from "react-hot-toast";

interface Candidate {
  userId: string;
  nickname: string;
  age: number;
  gender: string;
  bio?: string;
  photoUrls: string[];
}

export default function SwipePage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [matchedUser, setMatchedUser] = useState<{
    userId: string;
    nickname: string;
    age: number;
    mainPhoto: string | null;
  } | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);

  useEffect(() => {
    loadCandidates();
  }, []);

  async function loadCandidates() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/swipe/candidates?limit=10");
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error?.message || "候補の取得に失敗しました");
        return;
      }

      setCandidates(result.data.candidates || []);
    } catch (error) {
      toast.error("通信エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLike() {
    if (currentIndex >= candidates.length) return;

    const candidate = candidates[currentIndex];
    try {
      const res = await fetch("/api/swipe/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: candidate.userId }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error?.message || "いいねに失敗しました");
        return;
      }

      if (result.data.matched) {
        setMatchedUser(result.data.partner);
        setMatchId(result.data.matchId);
        setShowMatchModal(true);
      }

      // 次のカードへ
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      toast.error("通信エラーが発生しました");
    }
  }

  async function handleSkip() {
    if (currentIndex >= candidates.length) return;

    const candidate = candidates[currentIndex];
    try {
      const res = await fetch("/api/swipe/skip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: candidate.userId }),
      });

      if (!res.ok) {
        const result = await res.json();
        toast.error(result.error?.message || "スキップに失敗しました");
        return;
      }

      // 次のカードへ
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      toast.error("通信エラーが発生しました");
    }
  }

  function handleSendMessage() {
    if (matchId) {
      router.push(`/app/chat/${matchId}`);
    }
    setShowMatchModal(false);
  }

  function handleContinue() {
    setShowMatchModal(false);
    setMatchedUser(null);
    setMatchId(null);
  }

  // 候補がなくなったら再読み込み
  useEffect(() => {
    if (currentIndex >= candidates.length && candidates.length > 0) {
      loadCandidates();
      setCurrentIndex(0);
    }
  }, [currentIndex, candidates.length]);

  const currentCandidate = candidates[currentIndex];
  const visibleCandidates = candidates.slice(
    currentIndex,
    currentIndex + 3
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!currentCandidate) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-6xl mb-4">😊</div>
        <h2 className="text-xl font-bold mb-2">近くに新しいユーザーがいません</h2>
        <p className="text-gray-600 mb-6">後でもう一度確認してください</p>
        <Button onClick={() => router.push("/app/matches")}>
          マッチを見る
        </Button>
        <TabNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-sm mx-auto relative" style={{ height: "calc(100vh - 80px)" }}>
        {visibleCandidates.map((candidate, index) => (
          <SwipeCard
            key={candidate.userId}
            user={candidate}
            onLike={handleLike}
            onSkip={handleSkip}
            index={index}
          />
        ))}

        {/* アクションボタン */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-6">
          <button
            onClick={handleSkip}
            className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-3xl hover:bg-gray-50"
          >
            ×
          </button>
          <button
            onClick={handleLike}
            className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-3xl text-red-500 hover:bg-gray-50"
          >
            ♥
          </button>
        </div>
      </div>

      <MatchModal
        isOpen={showMatchModal}
        partner={matchedUser}
        onSendMessage={handleSendMessage}
        onContinue={handleContinue}
      />

      <TabNavigation />
    </div>
  );
}

