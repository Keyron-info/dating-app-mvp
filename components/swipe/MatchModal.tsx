"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

interface MatchModalProps {
  isOpen: boolean;
  partner: {
    userId: string;
    nickname: string;
    age: number;
    mainPhoto: string | null;
  } | null;
  onSendMessage: () => void;
  onContinue: () => void;
}

export function MatchModal({
  isOpen,
  partner,
  onSendMessage,
  onContinue,
}: MatchModalProps) {
  if (!isOpen || !partner) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">🎉 マッチングしました！</h2>
            
            <div className="flex items-center justify-center gap-4 my-6">
              <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
                {partner.mainPhoto && (
                  <Image
                    src={partner.mainPhoto}
                    alt={partner.nickname}
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                )}
              </div>
              <span className="text-4xl">♥</span>
              <div className="w-20 h-20 rounded-full bg-gray-200"></div>
            </div>

            <p className="text-xl mb-6">
              {partner.nickname}さんとマッチング！
            </p>

            <div className="space-y-3">
              <Button onClick={onSendMessage} className="w-full">
                メッセージを送る
              </Button>
              <button
                onClick={onContinue}
                className="w-full text-gray-600 hover:text-gray-800"
              >
                スワイプを続ける
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

