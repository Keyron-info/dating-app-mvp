"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/Button";

interface MessageInputProps {
  onSend: (content: string) => void;
  isLoading?: boolean;
}

export function MessageInput({ onSend, isLoading = false }: MessageInputProps) {
  const [content, setContent] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (trimmed && !isLoading) {
      onSend(trimmed);
      setContent("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t bg-white">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="メッセージを入力..."
        maxLength={1000}
        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isLoading}
      />
      <Button type="submit" disabled={!content.trim() || isLoading}>
        送信
      </Button>
    </form>
  );
}

