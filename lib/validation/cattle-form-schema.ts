import { z } from "zod";

export const genderSchema = z.enum(["Male", "Female"]);

export const purposeSchema = z.enum(["Meat", "Dairy", "Breeding"]);

export const cattleStatusSchema = z.enum([
  "Active",
  "Sold",
  "Deceased",
  "Transferred",
]);

export const healthStatusSchema = z.enum([
  "Healthy",
  "Sick",
  "Recovering",
  "NeedsCheckup",
]);

export const weightRecordSchema = z.object({
  measuredAt: z.string().min(1, "Measured date is required"),

  weightKg: z.coerce.number().positive("Weight must be greater than 0"),
});

export const cattleFormSchema = z.object({
  identificationNumber: z
    .string()
    .trim()
    .min(4, {
      message: "Identification is required",
    })
    .max(20, {
      message: "Identification number must be at most 20 characters long",
    }),

  name: z
    .string()
    .trim()
    .max(15, {
      message: "Name must be at most 15 characters long",
    })
    .optional()
    .or(z.literal("")),

  breed: z
    .string()
    .trim()
    .min(2, {
      message: "Breed is required",
    })
    .max(15, {
      message: "Breed must not be more than 15 characters long",
    }),

  gender: genderSchema,

  purpose: purposeSchema,

  dateOfBirth: z.string().min(1, {
    message: "Date of birth is required",
  }),

  currentStatus: cattleStatusSchema,

  healthStatus: healthStatusSchema,

  notes: z
    .string()
    .trim()
    .max(300, {
      message: "Notes must be at most 300 characters long",
    })
    .optional()
    .or(z.literal("")),

  color: z
    .string()
    .trim()
    .max(25, {
      message: "Color must be at most 25 characters long",
    })
    .optional()
    .or(z.literal("")),

  weightRecords: z.array(weightRecordSchema).optional().default([]),
});

export type CattleFormValues = z.infer<typeof cattleFormSchema>;
