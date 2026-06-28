import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CattleForm } from "./cattle-form";
import { cattleFormSchema } from "@/lib/validation/cattle-form-schema";
import z from "zod";
import { Pencil, Plus } from "lucide-react";

export function FormDialog({ type }: { type: "create" | "edit" }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          {type === "create" ? "Create" : "Edit"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {type === "create" ? "Create" : "Edit"} Cattle Info
          </DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <CattleForm type={type} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
