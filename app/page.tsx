import { DataTable } from "@/components/dashboard/data-table";
import { SectionCards } from "@/components/dashboard/section-cards";
import { CattleSearchParams, CattleTableRow } from "@/types";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { getCattleCount, getCattleData, getCattleStats } from "@/lib/data/api";
import { parsePagination } from "@/lib/data/cattle-filters";

type CattlePageProps = {
  searchParams: Promise<CattleSearchParams>;
};
export default async function Page({ searchParams }: CattlePageProps) {
  const params = await searchParams;
  const pagination = parsePagination(params);

  const [stats, tableData, totalCount] = await Promise.all([
    getCattleStats(),
    getCattleData({
      skip: pagination.skip,
      take: pagination.take,
    }),
    getCattleCount(),
  ]);
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards stats={stats} />

          <div className="px-4 lg:px-6">
            <DataTable data={tableData} />
            <TablePagination
              page={pagination.page}
              pageSize={pagination.pageSize}
              totalCount={totalCount}
              basePath="/"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
