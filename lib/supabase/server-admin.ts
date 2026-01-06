import { createClient } from "@supabase/supabase-js";

// サーバー側でのみ使用する管理者権限のSupabaseクライアント
// RLSをバイパスして直接データベースにアクセス
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

