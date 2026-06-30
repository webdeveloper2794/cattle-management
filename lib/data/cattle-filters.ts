import "server-only";

import { Prisma } from "@/app/generated/prisma/client";
import type { CattleFilterValues, CattleSearchParams } from "@/types";
import {
  cattleStatusSchema,
  genderSchema,
  healthStatusSchema,
  purposeSchema,
} from "@/lib/validation/cattle-form-schema";

const filterKeys = [
  "q",
  "gender",
  "purpose",
  "status",
  "health",
] satisfies (keyof CattleFilterValues)[];

function getFilterValue(
  searchParams: CattleSearchParams,
  key: keyof CattleFilterValues,
) {
  return searchParams[key]?.trim() ?? "";
}

export function parseCattleFilters(
  searchParams: CattleSearchParams,
): CattleFilterValues {
  return {
    q: getFilterValue(searchParams, "q"),
    gender: getFilterValue(searchParams, "gender"),
    purpose: getFilterValue(searchParams, "purpose"),
    status: getFilterValue(searchParams, "status"),
    health: getFilterValue(searchParams, "health"),
  };
}

export function getCattleFiltersPath(filters: CattleFilterValues) {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }

  const gender = genderSchema.safeParse(filters.gender);
  if (gender.success) {
    params.set("gender", gender.data);
  }

  const purpose = purposeSchema.safeParse(filters.purpose);
  if (purpose.success) {
    params.set("purpose", purpose.data);
  }

  const status = cattleStatusSchema.safeParse(filters.status);
  if (status.success) {
    params.set("status", status.data);
  }

  const health = healthStatusSchema.safeParse(filters.health);
  if (health.success) {
    params.set("health", health.data);
  }

  const query = params.toString();

  return query ? `/cattle?${query}` : "/cattle";
}

export function shouldRedirectToCleanCattleFilters(
  searchParams: CattleSearchParams,
  filters: CattleFilterValues,
) {
  const currentParams = new URLSearchParams();

  for (const key of filterKeys) {
    const value = searchParams[key];

    if (value !== undefined) {
      currentParams.set(key, value);
    }
  }

  const currentPath = currentParams.toString()
    ? `/cattle?${currentParams.toString()}`
    : "/cattle";

  return currentPath !== getCattleFiltersPath(filters);
}

export function buildCattleWhere(
  filters: CattleFilterValues,
): Prisma.CattleWhereInput {
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

  return and.length > 0 ? { AND: and } : {};
}

function getPositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

export function parsePagination(searchParams: CattleSearchParams) {
  const page = getPositiveInteger(searchParams.page, 1);
  const pageSize = Math.min(getPositiveInteger(searchParams.pageSize, 10), 50);

  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}
