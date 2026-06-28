import { revalidatePath } from "next/cache";

import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { weightRecordSchema } from "@/lib/validation/cattle-form-schema";

function handlePrismaError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return Response.json({ message: "Cattle record was not found" }, { status: 404 });
    }
  }

  console.error(error);
  return Response.json({ message: "Something went wrong" }, { status: 500 });
}

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/cattle/[id]/weight-records">,
) {
  const { id } = await ctx.params;
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = weightRecordSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        message: "Invalid weight record",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  try {
    const record = await prisma.weightRecord.create({
      data: {
        cattleId: id,
        measuredAt: new Date(`${parsed.data.measuredAt}T00:00:00.000Z`),
        weightKg: parsed.data.weightKg,
      },
      select: {
        id: true,
        measuredAt: true,
        weightKg: true,
      },
    });

    revalidatePath("/");
    revalidatePath("/cattle");

    return Response.json({ record }, { status: 201 });
  } catch (error) {
    return handlePrismaError(error);
  }
}
