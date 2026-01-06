"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TabNavigation() {
  const pathname = usePathname();

  const tabs = [
    { href: "/app/swipe", label: "スワイプ", icon: "🔥" },
    { href: "/app/matches", label: "マッチ", icon: "💬" },
    { href: "/app/profile", label: "MY", icon: "👤" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
      <div className="max-w-2xl mx-auto grid grid-cols-3">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-3 ${
                isActive ? "text-blue-600" : "text-gray-600"
              }`}
            >
              <span className="text-2xl mb-1">{tab.icon}</span>
              <span className="text-xs">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

