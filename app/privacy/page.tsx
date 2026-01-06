export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">プライバシーポリシー</h1>
        <div className="prose prose-sm max-w-none">
          <p className="mb-4">
            当社は、本サービスの提供にあたり、ユーザーの個人情報を適切に取り扱います。
          </p>
          <h2 className="text-xl font-bold mt-6 mb-3">1. 収集する情報</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>メールアドレス</li>
            <li>プロフィール情報（ニックネーム、生年月日、性別など）</li>
            <li>プロフィール写真</li>
            <li>メッセージ内容</li>
            <li>利用ログ</li>
          </ul>
          <h2 className="text-xl font-bold mt-6 mb-3">2. 利用目的</h2>
          <p className="mb-4">
            収集した情報は、本サービスの提供、改善、お問い合わせ対応のために使用します。
          </p>
          <h2 className="text-xl font-bold mt-6 mb-3">3. 第三者提供</h2>
          <p className="mb-4">
            当社は、法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。
          </p>
          <h2 className="text-xl font-bold mt-6 mb-3">4. データの保存期間</h2>
          <p className="mb-4">
            ユーザーがアカウントを削除するまで、または法律で定められた保存期間までデータを保存します。
          </p>
        </div>
      </div>
    </div>
  );
}

