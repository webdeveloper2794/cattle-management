"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/form/form-dialog";
import type { CattleTableRow } from "./table-types";

export function CattleActionsCell({ cattle }: { cattle: CattleTableRow }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  async function deleteCattle() {
    setIsDeleting(true);
    const toastId = toast.loading("Deleting cattle record...");

    try {
      const response = await fetch(`/api/cattle/${cattle.id}`, {
        method: "DELETE",
      });
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        toast.error(result?.message ?? "Unable to delete cattle record", {
          id: toastId,
        });
        return;
      }

      toast.success("Cattle record deleted", { id: toastId });
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Unable to delete cattle record", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <FormDialog
        type="edit"
        id={cattle.id}
        triggerLabel="Edit"
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

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Trash2 className="mr-2 size-4" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete cattle record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              {cattle.name || cattle.identificationNumber} from your herd
              records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                void deleteCattle();
              }}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
