"use client";

import { api } from "~/trpc/react";

export function LatestPost() {
  const [latestCall] = api.post.getLatestCall.useSuspenseQuery();

  return (
    <div className="w-full max-w-xs">
      {latestCall ? (
        <p className="truncate">
          Latest call: {latestCall.targetNumber} ({latestCall.amdStrategy})
        </p>
      ) : (
        <p>No calls yet.</p>
      )}
    </div>
  );
}
