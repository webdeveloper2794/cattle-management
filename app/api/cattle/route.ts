import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { cattleFormSchema } from "@/lib/validation/cattle-form-schema";
import {
  cattleFormToPrismaData,
  cattleSelect,
  handlePrismaError,
} from "@/lib/prisma-utils";

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
