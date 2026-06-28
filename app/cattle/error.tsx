"use client";

import { AppState } from "@/components/shared/app-state";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-4 lg:p-6">
      <AppState
        type="error"
        title="Unable to load cattle"
        description="Something went wrong while loading cattle records. Please try again."
        action={{
          label: "Try again",
          onClick: reset,
        }}
      />
    </div>
  );
}
