import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            ← 戻る
          </Link>
          <h1 className="text-3xl font-bold mt-4">アカウント作成</h1>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <RegisterForm />
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              既にアカウントをお持ちの方
            </p>
            <Link
              href="/auth/login"
              className="text-blue-600 hover:underline text-sm"
            >
              ログインはこちら
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

