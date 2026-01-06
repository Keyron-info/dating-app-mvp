import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Dating App</h1>
          <p className="mt-2 text-gray-600">ログイン</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <LoginForm />
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              アカウントをお持ちでない方
            </p>
            <Link
              href="/auth/register"
              className="text-blue-600 hover:underline text-sm"
            >
              新規登録はこちら
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

