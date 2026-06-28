import {
  DataTable,
  type CattleTableRow,
} from "@/components/dashboard/data-table";
import { FormDialog } from "@/components/form/form-dialog";
import {
  FormFilter,
  type CattleFilterValues,
} from "@/components/form/form-filter";
import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  cattleStatusSchema,
  genderSchema,
  healthStatusSchema,
  purposeSchema,
} from "@/lib/validation/cattle-form-schema";

type CattlePageProps = {
  searchParams: Promise<Partial<Record<keyof CattleFilterValues, string>>>;
};

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

function getFilterValue(
  searchParams: Partial<Record<keyof CattleFilterValues, string>>,
  key: keyof CattleFilterValues,
) {
  return searchParams[key]?.trim() ?? "";
}

function buildCattleWhere(
  filters: CattleFilterValues,
): Prisma.CattleWhereInput {
  const where: Prisma.CattleWhereInput = {};
  const and: Prisma.CattleWhereInput[] = [];

  if (filters.q) {
    and.push({
      OR: [
        { identificationNumber: { contains: filters.q, mode: "insensitive" } },
        { name: { contains: filters.q, mode: "insensitive" } },
        { breed: { contains: filters.q, mode: "insensitive" } },
        { color: { contains: filters.q, mode: "insensitive" } },
      ],
    });
  }

  const gender = genderSchema.safeParse(filters.gender);
  if (gender.success) {
    and.push({ gender: gender.data });
  }

  const purpose = purposeSchema.safeParse(filters.purpose);
  if (purpose.success) {
    and.push({ purpose: purpose.data });
  }

  const status = cattleStatusSchema.safeParse(filters.status);
  if (status.success) {
    and.push({ currentStatus: status.data });
  }

  const health = healthStatusSchema.safeParse(filters.health);
  if (health.success) {
    and.push({ healthStatus: health.data });
  }

  if (and.length > 0) {
    where.AND = and;
  }

  return where;
}

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

export default async function Page({ searchParams }: CattlePageProps) {
  const resolvedSearchParams = await searchParams;
  const filters: CattleFilterValues = {
    q: getFilterValue(resolvedSearchParams, "q"),
    gender: getFilterValue(resolvedSearchParams, "gender"),
    purpose: getFilterValue(resolvedSearchParams, "purpose"),
    status: getFilterValue(resolvedSearchParams, "status"),
    health: getFilterValue(resolvedSearchParams, "health"),
  };
  const cattle = await prisma.cattle.findMany({
    where: buildCattleWhere(filters),
    orderBy: [{ identificationNumber: "asc" }],
    select: cattleSelect,
  });
  const tableData = cattle.map(toTableRow);

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Cattle</h1>
          <p className="text-sm text-muted-foreground">
            Track herd records, statuses, and health details.
          </p>
        </div>

        <FormDialog type="create" />
      </div>

      <FormFilter filters={filters} />
      <DataTable data={tableData} />
    </div>
  );
}
