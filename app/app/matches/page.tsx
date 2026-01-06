import { MatchList } from "@/components/match/MatchList";
import { TabNavigation } from "@/components/layout/TabNavigation";

export default function MatchesPage() {
  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-2xl mx-auto">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold">マッチング</h1>
        </div>
        <MatchList />
      </div>
      <TabNavigation />
    </div>
  );
}

