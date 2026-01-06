import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { hashPassword } from "@/lib/auth/password";
import { errorResponse, APIError } from "@/lib/utils/api";

export const dynamic = 'force-dynamic';

// テストユーザーのデータ
const MALE_NAMES = [
  "太郎", "次郎", "三郎", "健太", "大輔", "翔太", "拓也", "直樹", "和也", "慎一"
];

const FEMALE_NAMES = [
  "花子", "美咲", "さくら", "あかり", "みゆき", "ゆい", "あや", "まな", "りん", "なな"
];

const MALE_PHOTOS = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1508341591423-4347099e1f19?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
];

const FEMALE_PHOTOS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
];

const BIOS = [
  "よろしくお願いします！",
  "楽しくお話しましょう",
  "趣味は映画鑑賞です",
  "カフェ巡りが好きです",
  "旅行が趣味です",
  "音楽を聴くのが好きです",
  "読書が趣味です",
  "スポーツ観戦が好きです",
  "料理を楽しんでいます",
  "自然が好きです",
];

function getRandomBirthdate(minAge: number = 20, maxAge: number = 35): string {
  const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
  const year = new Date().getFullYear() - age;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getRandomBio(): string {
  return BIOS[Math.floor(Math.random() * BIOS.length)];
}

export async function POST(request: Request) {
  try {
    // 本番環境では無効化（開発環境のみ）
    if (process.env.NODE_ENV === "production") {
      throw new APIError("FORBIDDEN", "このエンドポイントは本番環境では使用できません", 403);
    }

    const body = await request.json();
    const count = body.count || 10; // デフォルト10人ずつ

    const supabase = createAdminClient();
    const createdUsers: any[] = [];

    // 男性ユーザーを作成
    for (let i = 0; i < count; i++) {
      const email = `male${i + 1}@test.com`;
      const password = "test1234";
      const passwordHash = await hashPassword(password);

      // ユーザー作成
      const { data: user, error: userError } = await supabase
        .from("users")
        .insert({
          email,
          password_hash: passwordHash,
          email_verified: true,
          is_active: true,
        })
        .select()
        .single();

      if (userError) {
        console.error(`Failed to create user ${email}:`, userError);
        continue;
      }

      // プロフィール作成
      const birthdate = getRandomBirthdate(22, 35);
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: user.id,
          nickname: MALE_NAMES[i] || `男性${i + 1}`,
          birthdate,
          gender: "male",
          interested_in: ["female"],
          bio: getRandomBio(),
          photo_urls: [MALE_PHOTOS[i] || MALE_PHOTOS[0]],
          is_active: true,
        })
        .select()
        .single();

      if (profileError) {
        console.error(`Failed to create profile for ${email}:`, profileError);
      } else {
        createdUsers.push({
          email,
          password,
          userId: user.id,
          nickname: profile.nickname,
        });
      }
    }

    // 女性ユーザーを作成
    for (let i = 0; i < count; i++) {
      const email = `female${i + 1}@test.com`;
      const password = "test1234";
      const passwordHash = await hashPassword(password);

      // ユーザー作成
      const { data: user, error: userError } = await supabase
        .from("users")
        .insert({
          email,
          password_hash: passwordHash,
          email_verified: true,
          is_active: true,
        })
        .select()
        .single();

      if (userError) {
        console.error(`Failed to create user ${email}:`, userError);
        continue;
      }

      // プロフィール作成
      const birthdate = getRandomBirthdate(20, 32);
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: user.id,
          nickname: FEMALE_NAMES[i] || `女性${i + 1}`,
          birthdate,
          gender: "female",
          interested_in: ["male"],
          bio: getRandomBio(),
          photo_urls: [FEMALE_PHOTOS[i] || FEMALE_PHOTOS[0]],
          is_active: true,
        })
        .select()
        .single();

      if (profileError) {
        console.error(`Failed to create profile for ${email}:`, profileError);
      } else {
        createdUsers.push({
          email,
          password,
          userId: user.id,
          nickname: profile.nickname,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `${createdUsers.length}人のテストユーザーを作成しました`,
        users: createdUsers,
      },
    });
  } catch (error) {
    if (error instanceof APIError) {
      return errorResponse(error);
    }

    console.error("Seed users error:", error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : "テストユーザー作成に失敗しました";
    return errorResponse(
      new APIError("INTERNAL_ERROR", errorMessage, 500)
    );
  }
}

