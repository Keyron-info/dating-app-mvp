"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function DevPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  async function handleSeedUsers() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/dev/seed-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 10 }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error?.message || "テストユーザー作成に失敗しました");
        return;
      }

      toast.success(result.data.message);
      setUsers(result.data.users || []);
    } catch (error) {
      toast.error("通信エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleClearUsers() {
    if (!confirm("すべてのテストユーザーを削除しますか？")) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/dev/clear-test-users", {
        method: "POST",
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error?.message || "テストユーザー削除に失敗しました");
        return;
      }

      toast.success(result.data.message);
      setUsers([]);
    } catch (error) {
      toast.error("通信エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">開発用ツール</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">テストユーザー作成</h2>
            <p className="text-sm text-gray-600 mb-4">
              男性10人、女性10人のテストユーザーを作成します。
              <br />
              パスワードはすべて「test1234」です。
            </p>
            <Button
              onClick={handleSeedUsers}
              isLoading={isLoading}
              className="w-full"
            >
              テストユーザーを作成（男女10人ずつ）
            </Button>
          </div>

          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-2">テストユーザー削除</h2>
            <p className="text-sm text-gray-600 mb-4">
              @test.comで終わるメールアドレスのユーザーをすべて削除します。
            </p>
            <Button
              onClick={handleClearUsers}
              isLoading={isLoading}
              variant="danger"
              className="w-full"
            >
              テストユーザーを削除
            </Button>
          </div>

          {users.length > 0 && (
            <div className="border-t pt-4">
              <h2 className="text-lg font-semibold mb-2">作成されたユーザー</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {users.map((user, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                    <div className="font-medium">{user.nickname}</div>
                    <div className="text-gray-600">メール: {user.email}</div>
                    <div className="text-gray-600">パスワード: {user.password}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

