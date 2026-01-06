"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/types/message";
import toast from "react-hot-toast";

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.matchId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [partner, setPartner] = useState<{
    userId: string;
    nickname: string;
    age: number;
    mainPhoto: string | null;
  } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadMatchInfo();
    loadMessages();
    const cleanup = setupRealtime();
    return cleanup;
  }, [matchId]);

  async function loadMatchInfo() {
    try {
      const res = await fetch(`/api/matches/${matchId}`);
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error?.message || "マッチング情報の取得に失敗しました");
        router.push("/app/matches");
        return;
      }

      setPartner(result.data.match.partner);
    } catch (error) {
      toast.error("通信エラーが発生しました");
    }
  }

  async function loadMessages() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/messages/${matchId}`);
      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error?.message || "メッセージの取得に失敗しました");
        return;
      }

      setMessages(result.data.messages || []);

      // 現在のユーザーIDを取得（最初のメッセージから推測、またはAPIから取得）
      if (result.data.messages && result.data.messages.length > 0) {
        const myMessage = result.data.messages.find((m: Message) => m.isMine);
        if (myMessage) {
          setCurrentUserId(myMessage.senderId);
        }
      }

      // 現在のユーザーIDを取得（/api/auth/meから）
      const meRes = await fetch("/api/auth/me");
      const meResult = await meRes.json();
      if (meResult.success) {
        setCurrentUserId(meResult.data.user.id);
      }
    } catch (error) {
      toast.error("通信エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }

  function setupRealtime() {
    const supabase = createClient();

    const channel = supabase
      .channel(`match:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const newMessage = payload.new as any;
          setMessages((prev) => {
            // 重複チェック
            if (prev.some((m) => m.id === newMessage.id)) {
              return prev;
            }
            return [
              ...prev,
              {
                id: newMessage.id,
                matchId: newMessage.match_id,
                senderId: newMessage.sender_id,
                content: newMessage.content,
                readAt: newMessage.read_at || undefined,
                createdAt: newMessage.created_at,
                isMine: newMessage.sender_id === currentUserId,
              },
            ];
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }

  async function handleSend(content: string) {
    setIsSending(true);
    try {
      const res = await fetch(`/api/messages/${matchId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error?.message || "メッセージ送信に失敗しました");
        return;
      }

      // メッセージはRealtimeで自動的に追加される
    } catch (error) {
      toast.error("通信エラーが発生しました");
    } finally {
      setIsSending(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b p-4 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800"
        >
          ←
        </button>
        {partner && (
          <>
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
              {partner.mainPhoto ? (
                <Image
                  src={partner.mainPhoto}
                  alt={partner.nickname}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  👤
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="font-semibold">
                {partner.nickname}, {partner.age}
              </h1>
            </div>
          </>
        )}
      </div>

      {/* メッセージリスト */}
      <MessageList messages={messages} currentUserId={currentUserId} />

      {/* 入力エリア */}
      <MessageInput onSend={handleSend} isLoading={isSending} />
    </div>
  );
}

