// app/cattle/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>

        <Skeleton className="h-10 w-full sm:w-32" />
      </div>

      {/* Filter card */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              <Skeleton className="h-5 w-20" />
            </CardTitle>
            <CardDescription className="mt-2">
              <Skeleton className="h-4 w-64 max-w-full" />
            </CardDescription>
          </div>

          <CardAction>
            <Skeleton className="h-8 w-20" />
          </CardAction>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-full rounded-2xl" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="grid gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-full rounded-2xl" />
                </div>
              ))}
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Skeleton className="h-10 w-full sm:w-20" />
              <Skeleton className="h-10 w-full sm:w-28" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data table wrapper */}
      <div className="flex flex-col gap-4">
        {/* Table top toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-full sm:w-28" />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-md border">
          {/* Table header */}
          <div className="grid grid-cols-[48px_1.2fr_1fr_1fr_0.8fr_0.8fr_1fr_0.8fr_0.8fr_1fr_1.2fr] gap-4 bg-muted px-4 py-3">
            {Array.from({ length: 11 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>

          {/* Table rows */}
          <div className="divide-y">
            {Array.from({ length: 10 }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-[48px_1.2fr_1fr_1fr_0.8fr_0.8fr_1fr_0.8fr_0.8fr_1fr_1.2fr] gap-4 px-4 py-4"
              >
                {Array.from({ length: 11 }).map((_, cellIndex) => (
                  <Skeleton
                    key={cellIndex}
                    className={
                      cellIndex === 0
                        ? "size-4"
                        : cellIndex === 10
                          ? "h-8 w-full"
                          : "h-4 w-full"
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Pagination footer */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-4 w-32" />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-8 w-20" />
            </div>

            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-20" />

              <div className="flex items-center gap-2">
                <Skeleton className="hidden size-8 sm:flex" />
                <Skeleton className="size-8" />
                <Skeleton className="size-8" />
                <Skeleton className="hidden size-8 sm:flex" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
