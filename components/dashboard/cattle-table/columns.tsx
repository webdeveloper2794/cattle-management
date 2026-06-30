import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  displayEnum,
  formatDate,
  getAge,
  healthVariant,
  statusVariant,
} from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { CattleActionsCell } from "./cattle-actions-cell";
import { CattleDetailDrawer } from "./cattle-detail-drawer";
import type { CattleTableRow } from "./table-types";

export const columnLabels: Record<string, string> = {
  identificationNumber: "ID Number",
  name: "Name",
  breed: "Breed",
  gender: "Gender",
  purpose: "Purpose",
  dateOfBirth: "Birth Date",
  currentStatus: "Status",
  healthStatus: "Health",
  color: "Color",
};

export const columns: ColumnDef<CattleTableRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={`Select ${row.original.identificationNumber}`}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "identificationNumber",
    header: "ID Number",
    cell: ({ row }) => (
      <div className="min-w-28">
        <CattleDetailDrawer cattle={row.original}>
          {row.original.identificationNumber}
        </CattleDetailDrawer>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="min-w-32">
        <CattleDetailDrawer cattle={row.original}>
          {row.original.name || "Unnamed"}
        </CattleDetailDrawer>
      </div>
    ),
  },
  {
    accessorKey: "breed",
    header: "Breed",
    cell: ({ row }) => <div className="min-w-28">{row.original.breed}</div>,
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => (
      <Badge variant="outline">{displayEnum(row.original.gender)}</Badge>
    ),
  },
  {
    accessorKey: "purpose",
    header: "Purpose",
    cell: ({ row }) => (
      <Badge variant="outline">{displayEnum(row.original.purpose)}</Badge>
    ),
  },
  {
    accessorKey: "dateOfBirth",
    header: "Birth Date",
    cell: ({ row }) => (
      <div className="min-w-32">
        <div>{formatDate(row.original.dateOfBirth)}</div>
        <div className="text-xs text-muted-foreground">
          {getAge(row.original.dateOfBirth)}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "currentStatus",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusVariant(row.original.currentStatus)}>
        {displayEnum(row.original.currentStatus)}
      </Badge>
    ),
  },
  {
    accessorKey: "healthStatus",
    header: "Health",
    cell: ({ row }) => (
      <Badge variant={healthVariant(row.original.healthStatus)}>
        {displayEnum(row.original.healthStatus)}
      </Badge>
    ),
  },
  {
    accessorKey: "color",
    header: "Color",
    cell: ({ row }) => (
      <div className="min-w-28">
        {row.original.color || (
          <span className="text-muted-foreground">Not set</span>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => <CattleActionsCell cattle={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];
