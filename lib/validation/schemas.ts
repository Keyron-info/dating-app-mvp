import { z } from "zod";

// 会員登録
export const registerSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z
    .string()
    .min(8, "パスワードは8文字以上必要です")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, "英字と数字を含める必要があります"),
  age18Plus: z.boolean().refine((val) => val === true, {
    message: "18歳以上である必要があります",
  }),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "利用規約に同意する必要があります",
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ログイン
export const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// プロフィール作成
export const profileSchema = z.object({
  nickname: z
    .string()
    .min(2, "ニックネームは2文字以上必要です")
    .max(20, "ニックネームは20文字以内にしてください"),
  birthdate: z.string().refine(
    (val) => {
      const age =
        new Date().getFullYear() - new Date(val).getFullYear();
      return age >= 18;
    },
    { message: "18歳以上である必要があります" }
  ),
  gender: z.enum(["male", "female", "other"]),
  interestedIn: z
    .array(z.enum(["male", "female", "other", "all"]))
    .min(1, "最低1つ選択してください"),
  bio: z
    .string()
    .max(500, "自己紹介は500文字以内にしてください")
    .optional(),
  photoUrls: z
    .array(z.string().url())
    .min(1, "写真を最低1枚アップロードしてください")
    .max(3, "写真は最大3枚までです"),
});

export type ProfileInput = z.infer<typeof profileSchema>;

// メッセージ送信
export const messageSchema = z.object({
  content: z
    .string()
    .min(1, "メッセージを入力してください")
    .max(1000, "メッセージは1000文字以内にしてください")
    .refine((val) => val.trim().length > 0, {
      message: "空白のみのメッセージは送信できません",
    }),
});

export type MessageInput = z.infer<typeof messageSchema>;

