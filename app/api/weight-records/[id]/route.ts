import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { handlePrismaError } from "@/lib/prisma-utils";

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
