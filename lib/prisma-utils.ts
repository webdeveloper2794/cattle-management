import "server-only";

import { Prisma } from "@/app/generated/prisma/client";
import type { CattleFormValues } from "@/lib/validation/cattle-form-schema";

export function cattleFormToPrismaData(data: CattleFormValues) {
  return {
    identificationNumber: data.identificationNumber,
    name: data.name || null,
    breed: data.breed,
    gender: data.gender,
    purpose: data.purpose,
    dateOfBirth: new Date(`${data.dateOfBirth}T00:00:00.000Z`),
    currentStatus: data.currentStatus,
    healthStatus: data.healthStatus,
    notes: data.notes || null,
    color: data.color || null,
  };
}

export const cattleSelect = {
  id: true,
  identificationNumber: true,
  name: true,
  breed: true,
  gender: true,
  purpose: true,
  dateOfBirth: true,
  currentStatus: true,
  healthStatus: true,
  notes: true,
  color: true,
  weightRecords: {
    orderBy: {
      measuredAt: "desc",
    },
    select: {
      id: true,
      measuredAt: true,
      weightKg: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CattleSelect;

export function handlePrismaError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return Response.json(
        {
          message:
            "A cattle record with this identification number already exists",
          fieldErrors: {
            identificationNumber: ["Identification number is already in use"],
          },
        },
        { status: 409 },
      );
    }

    if (error.code === "P2025") {
      return Response.json(
        { message: "Cattle record was not found" },
        { status: 404 },
      );
    }
  }

  console.error(error);
  return Response.json({ message: "Something went wrong" }, { status: 500 });
}
