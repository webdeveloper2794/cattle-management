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

    if (error.code === "P2025") {
      return Response.json({ message: "Cattle record was not found" }, { status: 404 });
    }
  }

  console.error(error);
  return Response.json({ message: "Something went wrong" }, { status: 500 });
}

async function readCattleForm(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return {
      success: false,
      response: Response.json({ message: "Invalid JSON body" }, { status: 400 }),
    } as const;
  }

  const parsed = cattleFormSchema.safeParse(body);

  if (!parsed.success) {
    return {
      success: false,
      response: Response.json(
        {
          message: "Invalid cattle data",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 422 },
      ),
    } as const;
  }

  return {
    success: true,
    data: parsed.data,
  } as const;
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/cattle/[id]">,
) {
  const { id } = await ctx.params;
  const parsed = await readCattleForm(request);

  if (!parsed.success) {
    return parsed.response;
  }

  try {
    const cattle = await prisma.cattle.update({
      where: { id },
      data: cattleFormToPrismaData(parsed.data),
      select: cattleSelect,
    });

    revalidatePath("/");
    revalidatePath("/cattle");

    return Response.json({ cattle });
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/cattle/[id]">,
) {
  return PATCH(request, ctx);
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/cattle/[id]">,
) {
  const { id } = await ctx.params;

  try {
    await prisma.cattle.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/cattle");

    return Response.json({ message: "Cattle record deleted" });
  } catch (error) {
    return handlePrismaError(error);
  }
}
