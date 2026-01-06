import { ProfileForm } from "@/components/profile/ProfileForm";

export default function ProfileCreatePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">プロフィール作成</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <ProfileForm mode="create" />
        </div>
      </div>
    </div>
  );
}

