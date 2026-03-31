import { Suspense } from "react";
import ExploreClient from "./ExploreClient";
import { Loader2 } from "lucide-react";

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-black">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
        </div>
      }
    >
      <ExploreClient />
    </Suspense>
  );
}
