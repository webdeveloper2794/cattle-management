import { DataTable } from "@/components/dashboard/data-table";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { FormFilter } from "@/components/form/form-filter";
import { getCattleCount, getCattleData } from "@/lib/data/api";
import {
  buildCattleWhere,
  getCattleFiltersPath,
  parseCattleFilters,
  parsePagination,
  shouldRedirectToCleanCattleFilters,
} from "@/lib/data/cattle-filters";
import type { CattleSearchParams } from "@/types";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

const FormDialog = dynamic(
  () => import("@/components/form/form-dialog").then((mod) => mod.FormDialog),
  {
    loading: () => (
      <Button size="lg" disabled>
        Register Cattle
      </Button>
    ),
  },
);

type CattlePageProps = {
  searchParams: Promise<CattleSearchParams>;
};

export default async function Page({ searchParams }: CattlePageProps) {
  const params = await searchParams;
  const filters = parseCattleFilters(params);
  const where = buildCattleWhere(filters);
  const pagination = parsePagination(params);

  if (shouldRedirectToCleanCattleFilters(params, filters)) {
    redirect(getCattleFiltersPath(filters));
  }

  const [tableData, totalCount] = await Promise.all([
    getCattleData({
      where,
      skip: pagination.skip,
      take: pagination.take,
    }),
    getCattleCount(where),
  ]);

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
      <TablePagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalCount={totalCount}
        basePath={getCattleFiltersPath(filters)}
      />
    </div>
  );
}
