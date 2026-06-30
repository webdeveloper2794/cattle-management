import { revalidatePath } from "next/cache";

import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  cattleFormSchema,
  type CattleFormValues,
} from "@/lib/validation/cattle-form-schema";

import {
  cattleFormToPrismaData,
  cattleSelect,
  handlePrismaError,
} from "@/lib/prisma-utils";

async function readCattleForm(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return {
      success: false,
      response: Response.json(
        { message: "Invalid JSON body" },
        { status: 400 },
      ),
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
