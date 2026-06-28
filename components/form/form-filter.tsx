import Link from "next/link";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type CattleFilterValues = {
  q: string;
  gender: string;
  purpose: string;
  status: string;
  health: string;
};

type FormFilterProps = {
  filters: CattleFilterValues;
};

const genderOptions = ["Male", "Female"];
const purposeOptions = ["Dairy", "Meat", "Breeding"];
const statusOptions = ["Active", "Sold", "Deceased", "Transferred"];
const healthOptions = ["Healthy", "Sick", "Recovering", "NeedsCheckup"];

function FilterSelect({
  id,
  name,
  label,
  value,
  options,
}: {
  id: string;
  name: keyof CattleFilterValues;
  label: string;
  value: string;
  options: string[];
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue={value}
        className="h-8 w-full rounded-2xl border border-transparent bg-input/50 px-3 text-sm outline-none transition-[color,box-shadow] duration-200 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "NeedsCheckup" ? "Needs Checkup" : option}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FormFilter({ filters }: FormFilterProps) {
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
        <CardDescription>
          Narrow cattle records with URL-based filters.
        </CardDescription>
        <CardAction>
          {activeFilterCount > 0 ? (
            <Button asChild variant="ghost" size="sm">
              <Link href="/cattle">Clear</Link>
            </Button>
          ) : (
            <span className="text-sm text-muted-foreground">All records</span>
          )}
        </CardAction>
      </CardHeader>
      <CardContent>
        <form action="/cattle" method="get" className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="cattle-search" className="text-sm font-medium">
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="cattle-search"
                name="q"
                type="search"
                defaultValue={filters.q}
                placeholder="ID, name, breed, or color"
                className="h-8 w-full rounded-2xl border border-transparent bg-input/50 pr-3 pl-9 text-sm outline-none transition-[color,box-shadow] duration-200 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect
              id="cattle-gender"
              name="gender"
              label="Gender"
              value={filters.gender}
              options={genderOptions}
            />
            <FilterSelect
              id="cattle-purpose"
              name="purpose"
              label="Purpose"
              value={filters.purpose}
              options={purposeOptions}
            />
            <FilterSelect
              id="cattle-status"
              name="status"
              label="Status"
              value={filters.status}
              options={statusOptions}
            />
            <FilterSelect
              id="cattle-health"
              name="health"
              label="Health"
              value={filters.health}
              options={healthOptions}
            />
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button asChild variant="outline">
              <Link href="/cattle">Reset</Link>
            </Button>
            <Button type="submit">Apply filters</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
