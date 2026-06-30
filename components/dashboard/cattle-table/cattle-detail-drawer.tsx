"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  HeartPulse,
  Palette,
  Plus,
  Scale,
  Weight,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDialog } from "@/components/form/form-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  displayEnum,
  formatDate,
  getAge,
  getLatestWeight,
  getWeightDelta,
  healthVariant,
  statusVariant,
  todayInputValue,
} from "@/lib/utils";
import {
  CattleDetailMetric,
  DetailField,
  DetailSection,
} from "./detail-ui";
import type { CattleTableRow } from "./table-types";
import { WeightHistory } from "./weight-history";

export function CattleDetailDrawer({
  cattle,
  children,
}: {
  cattle: CattleTableRow;
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const latestWeight = getLatestWeight(cattle);
  const weightDelta = getWeightDelta(cattle);
  const [measuredAt, setMeasuredAt] = React.useState(todayInputValue);
  const [weightKg, setWeightKg] = React.useState("");
  const [isSavingWeight, setIsSavingWeight] = React.useState(false);
  const [deletingWeightId, setDeletingWeightId] = React.useState<string | null>(
    null,
  );

  async function addWeightRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingWeight(true);
    const toastId = toast.loading("Adding weight record...");

    try {
      const response = await fetch(`/api/cattle/${cattle.id}/weight-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          measuredAt,
          weightKg,
        }),
      });
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        toast.error(result?.message ?? "Unable to add weight record", {
          id: toastId,
        });
        return;
      }

      toast.success("Weight record added", { id: toastId });
      setWeightKg("");
      router.refresh();
    } catch {
      toast.error("Unable to add weight record", { id: toastId });
    } finally {
      setIsSavingWeight(false);
    }
  }

  async function deleteWeightRecord(recordId: string) {
    setDeletingWeightId(recordId);
    const toastId = toast.loading("Deleting weight record...");

    try {
      const response = await fetch(`/api/weight-records/${recordId}`, {
        method: "DELETE",
      });
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        toast.error(result?.message ?? "Unable to delete weight record", {
          id: toastId,
        });
        return;
      }

      toast.success("Weight record deleted", { id: toastId });
      router.refresh();
    } catch {
      toast.error("Unable to delete weight record", { id: toastId });
    } finally {
      setDeletingWeightId(null);
    }
  }

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="h-auto min-w-0 cursor-pointer px-0 text-left font-medium underline underline-offset-4 hover:text-primary"
        >
          <span className="truncate">{children}</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-2xl">
        <DrawerHeader className="px-5 pt-5 pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid min-w-0 gap-1">
              <DrawerTitle className="text-xl">
                {cattle.name || "Unnamed cattle"}
              </DrawerTitle>
              <DrawerDescription className="break-words">
                {cattle.identificationNumber} · {cattle.breed}
              </DrawerDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={statusVariant(cattle.currentStatus)}>
                {displayEnum(cattle.currentStatus)}
              </Badge>
              <Badge variant={healthVariant(cattle.healthStatus)}>
                {displayEnum(cattle.healthStatus)}
              </Badge>
            </div>
          </div>
        </DrawerHeader>

        <div className="grid gap-4 overflow-y-auto px-5 pb-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <CattleDetailMetric
              icon={<CalendarDays className="size-4" />}
              label="Age"
              value={getAge(cattle.dateOfBirth)}
              detail={formatDate(cattle.dateOfBirth)}
            />
            <CattleDetailMetric
              icon={<HeartPulse className="size-4" />}
              label="Health"
              value={displayEnum(cattle.healthStatus)}
              detail={`Status: ${displayEnum(cattle.currentStatus)}`}
            />
            <CattleDetailMetric
              icon={<Scale className="size-4" />}
              label="Latest Weight"
              value={
                latestWeight
                  ? `${latestWeight.weightKg.toLocaleString("en", {
                      maximumFractionDigits: 1,
                    })} kg`
                  : "Not recorded"
              }
              detail={
                latestWeight
                  ? `Measured ${formatDate(latestWeight.measuredAt)}`
                  : "Add a weight record to track growth"
              }
            />
            <CattleDetailMetric
              icon={<Weight className="size-4" />}
              label="Weight Change"
              value={
                weightDelta === null
                  ? "No trend"
                  : `${weightDelta > 0 ? "+" : ""}${weightDelta.toLocaleString(
                      "en",
                      { maximumFractionDigits: 1 },
                    )} kg`
              }
              detail={
                cattle.weightRecords.length > 1
                  ? "Compared with previous record"
                  : "Needs at least two records"
              }
            />
            <CattleDetailMetric
              icon={<ClipboardList className="size-4" />}
              label="Records"
              value={`${cattle.weightRecords.length} weight ${
                cattle.weightRecords.length === 1 ? "entry" : "entries"
              }`}
              detail={`Updated ${formatDate(cattle.updatedAt)}`}
            />
          </div>

          <DetailSection
            title="Profile"
            description="Core registration details for this animal."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailField label="Gender" value={displayEnum(cattle.gender)} />
              <DetailField
                label="Purpose"
                value={displayEnum(cattle.purpose)}
              />
              <DetailField
                label="Color"
                value={
                  <span className="inline-flex items-center gap-2">
                    <Palette className="size-4 text-muted-foreground" />
                    {cattle.color || "Not set"}
                  </span>
                }
              />
              <DetailField label="Breed" value={cattle.breed} />
              <DetailField
                label="Registered"
                value={formatDate(cattle.createdAt)}
              />
              <DetailField
                label="Last Updated"
                value={formatDate(cattle.updatedAt)}
              />
            </div>
          </DetailSection>

          <DetailSection
            title="Notes"
            description="Handling, care, or farm observations saved with this record."
          >
            {cattle.notes?.trim() ? (
              <div className="rounded-md bg-muted/40 p-3 text-sm leading-6 text-foreground">
                {cattle.notes.trim()}
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                No notes recorded yet.
              </div>
            )}
          </DetailSection>

          <DetailSection
            title="Weight History"
            description={`${cattle.weightRecords.length} record${
              cattle.weightRecords.length === 1 ? "" : "s"
            } saved for this animal.`}
          >
            <form
              onSubmit={addWeightRecord}
              className="grid gap-3 rounded-md bg-muted/30 p-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <div className="grid gap-1.5">
                <Label htmlFor={`${cattle.id}-weight-date`}>Date</Label>
                <Input
                  id={`${cattle.id}-weight-date`}
                  type="date"
                  value={measuredAt}
                  onChange={(event) => setMeasuredAt(event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={`${cattle.id}-weight-kg`}>Weight kg</Label>
                <Input
                  id={`${cattle.id}-weight-kg`}
                  type="number"
                  min="1"
                  step="0.1"
                  value={weightKg}
                  onChange={(event) => setWeightKg(event.target.value)}
                  placeholder="420.5"
                  required
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={isSavingWeight}
                >
                  <Plus className="size-4" />
                  {isSavingWeight ? "Adding..." : "Add"}
                </Button>
              </div>
            </form>

            <WeightHistory
              cattle={cattle}
              onDelete={(recordId) => void deleteWeightRecord(recordId)}
              deletingId={deletingWeightId}
            />
          </DetailSection>
        </div>

        <DrawerFooter className="px-5 pt-3">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
            <FormDialog
              type="edit"
              id={cattle.id}
              triggerLabel="Edit Record"
              defaultValues={{
                identificationNumber: cattle.identificationNumber,
                name: cattle.name ?? "",
                breed: cattle.breed,
                gender: cattle.gender,
                purpose: cattle.purpose,
                dateOfBirth: cattle.dateOfBirth.slice(0, 10),
                currentStatus: cattle.currentStatus,
                healthStatus: cattle.healthStatus,
                notes: cattle.notes ?? "",
                color: cattle.color ?? "",
              }}
            />
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
