"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, PanInfo } from "framer-motion";

interface SwipeCardProps {
  user: {
    userId: string;
    nickname: string;
    age: number;
    gender: string;
    bio?: string;
    photoUrls: string[];
  };
  onLike: () => void;
  onSkip: () => void;
  index: number;
}

export function SwipeCard({ user, onLike, onSkip, index }: SwipeCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [dragDirection, setDragDirection] = useState<"left" | "right" | null>(
    null
  );

  function handleDragEnd(
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onLike();
    } else if (info.offset.x < -threshold) {
      onSkip();
    }
  }

  function handleDrag(event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (info.offset.x > 50) {
      setDragDirection("right");
    } else if (info.offset.x < -50) {
      setDragDirection("left");
    } else {
      setDragDirection(null);
    }
  }

  function nextPhoto() {
    if (user.photoUrls.length > 1) {
      setCurrentPhotoIndex((prev) => (prev + 1) % user.photoUrls.length);
    }
  }

  function prevPhoto() {
    if (user.photoUrls.length > 1) {
      setCurrentPhotoIndex(
        (prev) => (prev - 1 + user.photoUrls.length) % user.photoUrls.length
      );
    }
  }

  return (
    <motion.div
      className="absolute w-full max-w-sm mx-auto"
      style={{ zIndex: 100 - index }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      initial={{ scale: 1, opacity: 1 }}
      animate={{
        x: dragDirection === "right" ? 50 : dragDirection === "left" ? -50 : 0,
        rotate: dragDirection === "right" ? 10 : dragDirection === "left" ? -10 : 0,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* 写真カルーセル */}
        <div className="relative aspect-[3/4] bg-gray-200">
          {user.photoUrls[currentPhotoIndex] && (
            <Image
              src={user.photoUrls[currentPhotoIndex]}
              alt={`${user.nickname}の写真`}
              fill
              className="object-cover"
              priority
            />
          )}
          
          {/* 写真インジケーター */}
          {user.photoUrls.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {user.photoUrls.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i === currentPhotoIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}

          {/* スワイプ方向インジケーター */}
          {dragDirection === "right" && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
              <span className="text-6xl">♥</span>
            </div>
          )}
          {dragDirection === "left" && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
              <span className="text-6xl">×</span>
            </div>
          )}

          {/* 写真切り替えボタン（タッチ用） */}
          {user.photoUrls.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevPhoto}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/30 rounded-full flex items-center justify-center text-white"
              >
                ←
              </button>
              <button
                type="button"
                onClick={nextPhoto}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/30 rounded-full flex items-center justify-center text-white"
              >
                →
              </button>
            </>
          )}
        </div>

        {/* ユーザー情報 */}
        <div className="p-4">
          <h2 className="text-2xl font-bold">
            {user.nickname}, {user.age}
          </h2>
          {user.bio && (
            <p className="mt-2 text-gray-600 line-clamp-3">{user.bio}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

