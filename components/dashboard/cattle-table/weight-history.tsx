import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { CattleTableRow } from "./table-types";

export function WeightHistory({
  cattle,
  onDelete,
  deletingId,
}: {
  cattle: CattleTableRow;
  onDelete: (recordId: string) => void;
  deletingId: string | null;
}) {
  if (cattle.weightRecords.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
        No weight records yet.
      </div>
    );
  }

  const maxWeight = Math.max(
    ...cattle.weightRecords.map((record) => record.weightKg),
  );

  return (
    <div className="space-y-3">
      {cattle.weightRecords.map((record) => {
        const width = maxWeight > 0 ? (record.weightKg / maxWeight) * 100 : 0;

        return (
          <div key={record.id} className="grid gap-2 rounded-md border p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">
                  {formatDate(record.measuredAt)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Weight check
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm tabular-nums text-muted-foreground">
                  {record.weightKg.toLocaleString("en", {
                    maximumFractionDigits: 1,
                  })}{" "}
                  kg
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onDelete(record.id)}
                  disabled={deletingId === record.id}
                >
                  <Trash2 className="size-3.5" />
                  <span className="sr-only">Delete weight record</span>
                </Button>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
