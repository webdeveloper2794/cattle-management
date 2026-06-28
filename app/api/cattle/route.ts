import { revalidatePath } from "next/cache";

import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  cattleFormSchema,
  type CattleFormValues,
} from "@/lib/validation/cattle-form-schema";

function cattleFormToPrismaData(data: CattleFormValues) {
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

const cattleSelect = {
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

function handlePrismaError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return Response.json(
        {
          message: "A cattle record with this identification number already exists",
          fieldErrors: {
            identificationNumber: ["Identification number is already in use"],
          },
        },
        { status: 409 },
      );
    }
  }

  console.error(error);
  return Response.json({ message: "Something went wrong" }, { status: 500 });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = cattleFormSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        message: "Invalid cattle data",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  try {
    const cattle = await prisma.cattle.create({
      data: cattleFormToPrismaData(parsed.data),
      select: cattleSelect,
    });

    revalidatePath("/");
    revalidatePath("/cattle");

    return Response.json({ cattle }, { status: 201 });
  } catch (error) {
    return handlePrismaError(error);
  }
}
