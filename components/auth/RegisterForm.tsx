"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  type RegisterInput,
} from "@/lib/validation/schemas";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      age18Plus: false,
      termsAccepted: false,
    },
  });

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("Registration failed:", result);
        if (result.error?.details) {
          if (typeof result.error.details === 'object') {
            Object.values(result.error.details).forEach((msg: any) => {
              toast.error(String(msg));
            });
          } else {
            toast.error(String(result.error.details));
          }
        } else {
          toast.error(result.error?.message || "登録に失敗しました");
        }
        return;
      }

      toast.success("登録が完了しました");
      router.push(result.data.redirectTo);
    } catch (error) {
      toast.error("通信エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register("email")}
        type="email"
        label="メールアドレス"
        placeholder="user@example.com"
        error={errors.email?.message}
      />
      <Input
        {...register("password")}
        type="password"
        label="パスワード"
        placeholder="8文字以上、英数字を含む"
        error={errors.password?.message}
      />
      <Checkbox
        {...register("age18Plus")}
        label="18歳以上です"
        error={errors.age18Plus?.message}
      />
      <Checkbox
        {...register("termsAccepted")}
        label={
          <>
            <Link href="/terms" className="text-blue-600 underline">
              利用規約
            </Link>
            に同意します
          </>
        }
        error={errors.termsAccepted?.message}
      />
      <Button type="submit" isLoading={isLoading} className="w-full">
        登録する
      </Button>
    </form>
  );
}

