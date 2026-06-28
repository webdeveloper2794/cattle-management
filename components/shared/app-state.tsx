// components/shared/app-state.tsx
import Link from "next/link";
import {
  AlertCircleIcon,
  CirclePlusIcon,
  DatabaseIcon,
  SearchXIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type AppStateType = "empty" | "error" | "not-found";

type AppStateProps = {
  type: AppStateType;
  title: string;
  description?: string;
  className?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
};

const icons = {
  empty: DatabaseIcon,
  error: AlertCircleIcon,
  "not-found": SearchXIcon,
};

export function AppState({
  type,
  title,
  description,
  action,
  className,
}: AppStateProps) {
  const Icon = icons[type];

  return (
    <Empty className="min-h-[420px] border border-dashed text-black">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>

        <EmptyTitle>{title}</EmptyTitle>

        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>

      {action && (
        <EmptyContent>
          {action.href ? (
            <Button asChild>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </EmptyContent>
      )}
    </Empty>
  );
}
