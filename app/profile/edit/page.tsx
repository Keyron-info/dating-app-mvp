import { ProfileForm } from "@/components/profile/ProfileForm";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function ProfileEditPage() {
  const session = await getSession();
  if (!session) {
    redirect("/auth/login");
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", session.userId)
    .single();

  if (!profile) {
    redirect("/profile/create");
  }

  const initialData = {
    id: profile.id,
    userId: profile.user_id,
    nickname: profile.nickname,
    birthdate: profile.birthdate,
    age: profile.age,
    gender: profile.gender as "male" | "female" | "other",
    interestedIn: profile.interested_in as (
      | "male"
      | "female"
      | "other"
      | "all"
    )[],
    bio: profile.bio || undefined,
    photoUrls: profile.photo_urls,
    isProfileComplete: profile.is_profile_complete,
    isActive: profile.is_active,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">プロフィール編集</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <ProfileForm mode="edit" initialData={initialData} />
        </div>
      </div>
    </div>
  );
}

