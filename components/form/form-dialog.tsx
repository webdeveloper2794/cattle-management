"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { CattleForm } from "./cattle-form";
import { cattleFormSchema } from "@/lib/validation/cattle-form-schema";
import * as z from "zod";

type CattleFormValues = z.infer<typeof cattleFormSchema>;

type CattleFormDialogProps = {
  type: "create" | "edit";
  id?: string;
  defaultValues?: Partial<CattleFormValues>;
  triggerLabel?: string;
};

export function FormDialog({
  type,
  id,
  defaultValues,
  triggerLabel,
}: CattleFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const isCreate = type === "create";
  const closeDialog = () => setOpen(false);

  function keepSelectMenusOpen(event: Event) {
    const target = event.target;

    if (
      target instanceof HTMLElement &&
      target.closest("[data-slot='select-content']")
    ) {
      event.preventDefault();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={isCreate ? "default" : "outline"} size="lg">
          {isCreate ? (
            <Plus className="mr-2 size-4" />
          ) : (
            <Pencil className="mr-2 size-4" />
          )}

          {triggerLabel ?? (isCreate ? "Register Cattle" : "Edit")}
        </Button>
      </DialogTrigger>

      <DialogContent
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-2xl md:max-w-3xl"
        onPointerDownOutside={keepSelectMenusOpen}
        onInteractOutside={keepSelectMenusOpen}
      >
        <DialogHeader>
          <DialogTitle>
            {isCreate ? "Register Cattle" : "Edit Cattle"}
          </DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Add a new animal to your farm records."
              : "Update this animal's information to keep your records accurate."}
          </DialogDescription>
        </DialogHeader>

        <CattleForm
          type={type}
          id={id}
          defaultValues={defaultValues}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
          onCancel={closeDialog}
        />
      </DialogContent>
    </Dialog>
  );
}
