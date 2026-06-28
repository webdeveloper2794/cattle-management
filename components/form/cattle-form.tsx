"use client";

import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InputGroup, InputGroupTextarea } from "@/components/ui/input-group";

import { cattleFormSchema } from "@/lib/validation/cattle-form-schema";

type CattleFormValues = z.infer<typeof cattleFormSchema>;
type CattleFormInput = z.input<typeof cattleFormSchema>;

type CattleFormProps = {
  type: "create" | "edit";
  id?: string;
  defaultValues?: Partial<CattleFormValues>;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const fallbackDefaultValues: CattleFormValues = {
  identificationNumber: "",
  name: "",
  breed: "",
  gender: "Female",
  purpose: "Dairy",
  dateOfBirth: "",
  currentStatus: "Active",
  healthStatus: "Healthy",
  notes: "",
  color: "",
  weightRecords: [],
};

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <span className="text-destructive">*</span>
    </>
  );
}

function OptionalLabel({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <span className="text-xs font-normal text-muted-foreground">
        optional
      </span>
    </>
  );
}

export function CattleForm({
  type,
  id,
  defaultValues,
  onSuccess,
  onCancel,
}: CattleFormProps) {
  const formId = React.useId();

  const form = useForm<CattleFormInput, undefined, CattleFormValues>({
    resolver: zodResolver(cattleFormSchema),
    defaultValues: {
      ...fallbackDefaultValues,
      ...defaultValues,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(data: CattleFormValues) {
    const toastId = toast.loading(
      type === "create" ? "Registering cattle..." : "Saving cattle changes...",
    );

    try {
      if (type === "edit" && !id) {
        toast.error("Missing cattle id", { id: toastId });
        return;
      }

      const response = await fetch(
        type === "create" ? "/api/cattle" : `/api/cattle/${id}`,
        {
          method: type === "create" ? "POST" : "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );

      const result = (await response.json().catch(() => null)) as {
        message?: string;
        fieldErrors?: Partial<Record<keyof CattleFormInput, string[]>>;
      } | null;

      if (!response.ok) {
        if (result?.fieldErrors) {
          for (const [fieldName, messages] of Object.entries(
            result.fieldErrors,
          ) as [keyof CattleFormInput, string[]][]) {
            if (messages?.[0]) {
              form.setError(fieldName, { message: messages[0] });
            }
          }
        }

        toast.error(result?.message ?? "Something went wrong", {
          id: toastId,
        });
        return;
      }

      toast.success(
        type === "create"
          ? "Cattle registered successfully"
          : "Cattle updated successfully",
        { id: toastId },
      );

      if (type === "create") {
        form.reset(fallbackDefaultValues);
      }

      onSuccess?.();
    } catch {
      toast.error("Unable to save cattle. Please try again.", { id: toastId });
    }
  }

  return (
    <>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Controller
            name="identificationNumber"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${formId}-identification`}>
                  <RequiredLabel>Identification Number</RequiredLabel>
                </FieldLabel>
                <Input
                  {...field}
                  id={`${formId}-identification`}
                  placeholder="C-001"
                  autoComplete="off"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${formId}-name`}>
                  <OptionalLabel>Name</OptionalLabel>
                </FieldLabel>
                <Input
                  {...field}
                  id={`${formId}-name`}
                  placeholder="Bella"
                  autoComplete="off"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="breed"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${formId}-breed`}>
                  <RequiredLabel>Breed</RequiredLabel>
                </FieldLabel>
                <Input
                  {...field}
                  id={`${formId}-breed`}
                  placeholder="Holstein"
                  autoComplete="off"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="gender"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  <RequiredLabel>Gender</RequiredLabel>
                </FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="purpose"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  <RequiredLabel>Purpose</RequiredLabel>
                </FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dairy">Dairy</SelectItem>
                    <SelectItem value="Meat">Meat</SelectItem>
                    <SelectItem value="Breeding">Breeding</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="dateOfBirth"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${formId}-date-of-birth`}>
                  <RequiredLabel>Date of Birth</RequiredLabel>
                </FieldLabel>
                <Input
                  {...field}
                  id={`${formId}-date-of-birth`}
                  type="date"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="currentStatus"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  <RequiredLabel>Current Status</RequiredLabel>
                </FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Sold">Sold</SelectItem>
                    <SelectItem value="Deceased">Deceased</SelectItem>
                    <SelectItem value="Transferred">Transferred</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="healthStatus"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  <RequiredLabel>Health Status</RequiredLabel>
                </FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Select health status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Healthy">Healthy</SelectItem>
                    <SelectItem value="Sick">Sick</SelectItem>
                    <SelectItem value="Recovering">Recovering</SelectItem>
                    <SelectItem value="NeedsCheckup">Needs Checkup</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="color"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${formId}-color`}>
                  <OptionalLabel>Color</OptionalLabel>
                </FieldLabel>
                <Input
                  {...field}
                  id={`${formId}-color`}
                  placeholder="Black and white"
                  autoComplete="off"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="notes"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="md:col-span-3"
              >
                <FieldLabel htmlFor={`${formId}-notes`}>
                  <OptionalLabel>Notes</OptionalLabel>
                </FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    id={`${formId}-notes`}
                    placeholder="Any special notes about this animal..."
                    rows={4}
                    className="min-h-24 resize-none"
                    aria-invalid={fieldState.invalid}
                  />
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </form>

      <div className="sticky bottom-0 -mx-1 flex flex-col-reverse gap-2 bg-popover/95 pt-4 backdrop-blur sm:mx-0 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          form={formId}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting
            ? "Saving..."
            : type === "create"
              ? "Create Cattle"
              : "Save Changes"}
        </Button>
      </div>
    </>
  );
}
