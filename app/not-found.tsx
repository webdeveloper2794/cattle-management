import { AppState } from "@/components/shared/app-state";

export default function NotFound() {
  return (
    <div className="p-4 lg:p-6">
      <AppState
        type="not-found"
        title="Page not found"
        description="The page or record you are looking for does not exist."
        action={{
          label: "Back to Home",
          href: "/",
        }}
      />
    </div>
  );
}
