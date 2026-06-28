import {
  ChartAreaInteractive,
  type WeightActivityPoint,
} from "@/components/dashboard/chart-area-interactive";
import {
  DataTable,
  type CattleTableRow,
} from "@/components/dashboard/data-table";
import {
  SectionCards,
  type DashboardStats,
} from "@/components/dashboard/section-cards";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

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

function toTableRow(cattle: {
  id: string;
  identificationNumber: string;
  name: string | null;
  breed: string;
  gender: CattleTableRow["gender"];
  purpose: CattleTableRow["purpose"];
  dateOfBirth: Date;
  currentStatus: CattleTableRow["currentStatus"];
  healthStatus: CattleTableRow["healthStatus"];
  notes: string | null;
  color: string | null;
  weightRecords: {
    id: string;
    measuredAt: Date;
    weightKg: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}): CattleTableRow {
  return {
    ...cattle,
    dateOfBirth: cattle.dateOfBirth.toISOString(),
    weightRecords: cattle.weightRecords.map((record) => ({
      ...record,
      measuredAt: record.measuredAt.toISOString(),
    })),
    createdAt: cattle.createdAt.toISOString(),
    updatedAt: cattle.updatedAt.toISOString(),
  };
}

function getDashboardStats(data: CattleTableRow[]): DashboardStats {
  return {
    totalCattle: data.length,
    activeCattle: data.filter((cattle) => cattle.currentStatus === "Active")
      .length,
    healthAlerts: data.filter(
      (cattle) =>
        cattle.healthStatus === "Sick" ||
        cattle.healthStatus === "NeedsCheckup",
    ).length,
    meatCattle: data.filter((cattle) => cattle.purpose === "Meat").length,
    dairyCattle: data.filter((cattle) => cattle.purpose === "Dairy").length,
    breedingCattle: data.filter((cattle) => cattle.purpose === "Breeding")
      .length,
    weightRecords: data.reduce(
      (total, cattle) => total + cattle.weightRecords.length,
      0,
    ),
  };
}

function getWeightActivity(data: CattleTableRow[]): WeightActivityPoint[] {
  const monthCounts = new Map<string, number>();

  for (const cattle of data) {
    for (const record of cattle.weightRecords) {
      const date = new Date(record.measuredAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0",
      )}`;
      monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
    }
  }

  return [...monthCounts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, records]) => {
      const [year, month] = key.split("-");
      const date = new Date(Number(year), Number(month) - 1, 1);

      return {
        month: date.toLocaleDateString("en", { month: "short" }),
        records,
      };
    });
}

export default async function Page() {
  const cattle = await prisma.cattle.findMany({
    orderBy: [{ identificationNumber: "asc" }],
    select: cattleSelect,
  });
  const tableData = cattle.map(toTableRow);
  const stats = getDashboardStats(tableData);
  const weightActivity = getWeightActivity(tableData);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards stats={stats} />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive data={weightActivity} />
          </div>
          <div className="px-4 lg:px-6">
            <DataTable data={tableData} />
          </div>
        </div>
      </div>
    </div>
  );
}
