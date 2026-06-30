import Link from "next/link";
import type { ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type TablePaginationProps = {
  page: number;
  pageSize: number;
  totalCount: number;
  basePath: string;
};

function getPageHref(basePath: string, page: number) {
  // URL needs an absolute base for parsing, but we only return the app-relative path.
  const url = new URL(basePath, "http://local");

  if (page > 1) {
    url.searchParams.set("page", String(page));
  } else {
    url.searchParams.delete("page");
  }

  return `${url.pathname}${url.search}`;
}

function PaginationIconButton({
  href,
  disabled,
  label,
  children,
  className,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  if (disabled) {
    return (
      <Button
        variant="outline"
        size="icon"
        className={className}
        disabled
        aria-label={label}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button asChild variant="outline" size="icon" className={className}>
      <Link href={href} aria-label={label}>
        {children}
      </Link>
    </Button>
  );
}

export function TablePagination({
  page,
  pageSize,
  totalCount,
  basePath,
}: TablePaginationProps) {
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(page, 1), pageCount);
  const canPreviousPage = currentPage > 1;
  const canNextPage = currentPage < pageCount;
  const firstRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastRecord = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        Showing {firstRecord}-{lastRecord} of {totalCount} cattle record
        {totalCount === 1 ? "" : "s"}.
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium">
            Page {currentPage} of {pageCount}
          </div>

          <div className="flex items-center gap-2">
            <PaginationIconButton
              href={getPageHref(basePath, 1)}
              disabled={!canPreviousPage}
              label="Go to first page"
              className="hidden size-8 sm:inline-flex"
            >
              <ChevronsLeft />
            </PaginationIconButton>
            <PaginationIconButton
              href={getPageHref(basePath, currentPage - 1)}
              disabled={!canPreviousPage}
              label="Go to previous page"
              className="size-8"
            >
              <ChevronLeft />
            </PaginationIconButton>
            <PaginationIconButton
              href={getPageHref(basePath, currentPage + 1)}
              disabled={!canNextPage}
              label="Go to next page"
              className="size-8"
            >
              <ChevronRight />
            </PaginationIconButton>
            <PaginationIconButton
              href={getPageHref(basePath, pageCount)}
              disabled={!canNextPage}
              label="Go to last page"
              className="hidden size-8 sm:inline-flex"
            >
              <ChevronsRight />
            </PaginationIconButton>
          </div>
        </div>
      </div>
    </div>
  );
}
