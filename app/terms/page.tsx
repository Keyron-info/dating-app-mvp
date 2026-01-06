export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">利用規約</h1>
        <div className="prose prose-sm max-w-none">
          <p className="mb-4">
            本利用規約（以下「本規約」といいます。）は、当社が提供するサービス（以下「本サービス」といいます。）の利用条件を定めるものです。
          </p>
          <h2 className="text-xl font-bold mt-6 mb-3">1. 適用</h2>
          <p className="mb-4">
            本規約は、本サービスの利用に関して、当社とユーザーとの間の権利義務関係を定めることを目的とし、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されます。
          </p>
          <h2 className="text-xl font-bold mt-6 mb-3">2. 利用条件</h2>
          <p className="mb-4">
            本サービスは、18歳以上の方のみが利用できます。18歳未満の方はご利用いただけません。
          </p>
          <h2 className="text-xl font-bold mt-6 mb-3">3. 禁止事項</h2>
          <ul className="list-disc pl-6 mb-4">
            <li>なりすまし行為</li>
            <li>商業利用</li>
            <li>誹謗中傷</li>
            <li>わいせつな内容の投稿</li>
            <li>個人情報の要求・公開</li>
          </ul>
          <h2 className="text-xl font-bold mt-6 mb-3">4. 免責事項</h2>
          <p className="mb-4">
            当社は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡、紛争等について一切責任を負いません。
          </p>
        </div>
      </div>
    </div>
  );
}

