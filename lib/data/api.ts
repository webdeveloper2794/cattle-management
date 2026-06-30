import "server-only";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import type { CattleTableRow, DashboardStats } from "@/types";
import { cattleSelect } from "@/lib/prisma-utils";

type CattleData = Prisma.CattleGetPayload<{ select: typeof cattleSelect }>;

function toTableRow(data: CattleData): CattleTableRow {
  return {
    ...data,
    dateOfBirth: data.dateOfBirth.toISOString(),
    weightRecords: data.weightRecords.map((record) => ({
      ...record,
      measuredAt: record.measuredAt.toISOString(),
    })),
    createdAt: data.createdAt.toISOString(),
    updatedAt: data.updatedAt.toISOString(),
  };
}
type GetCattleDataOptions = {
  where?: Prisma.CattleWhereInput;
  skip?: number;
  take?: number;
};

export async function getCattleData({
  where,
  skip,
  take,
}: GetCattleDataOptions = {}): Promise<CattleTableRow[]> {
  const cattle = await prisma.cattle.findMany({
    where,
    skip,
    take,
    orderBy: [{ identificationNumber: "asc" }],
    select: cattleSelect,
  });
  return cattle.map(toTableRow);
}

export async function getCattleCount(where?: Prisma.CattleWhereInput) {
  return prisma.cattle.count({ where });
}
export async function getCattleStats(): Promise<DashboardStats> {
  const [
    totalCattle,
    activeCattle,
    healthAlerts,
    meatCattle,
    dairyCattle,
    breedingCattle,
    weightRecords,
  ] = await Promise.all([
    prisma.cattle.count(),
    prisma.cattle.count({
      where: { currentStatus: "Active" },
    }),
    prisma.cattle.count({
      where: {
        healthStatus: {
          in: ["Sick", "NeedsCheckup"],
        },
      },
    }),
    prisma.cattle.count({
      where: {
        purpose: "Meat",
      },
    }),
    prisma.cattle.count({ where: { purpose: "Dairy" } }),
    prisma.cattle.count({ where: { purpose: "Breeding" } }),
    prisma.weightRecord.count(),
  ]);
  return {
    totalCattle,
    activeCattle,
    healthAlerts,
    meatCattle,
    dairyCattle,
    breedingCattle,
    weightRecords,
  };
}
