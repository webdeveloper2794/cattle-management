import { revalidatePath } from "next/cache";

import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

function handlePrismaError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return Response.json({ message: "Weight record was not found" }, { status: 404 });
    }
  }

  console.error(error);
  return Response.json({ message: "Something went wrong" }, { status: 500 });
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/weight-records/[id]">,
) {
  const { id } = await ctx.params;

  try {
    await prisma.weightRecord.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/cattle");

    return Response.json({ message: "Weight record deleted" });
  } catch (error) {
    return handlePrismaError(error);
  }
}
