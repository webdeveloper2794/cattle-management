"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  Columns3,
  HeartPulse,
  Palette,
  Plus,
  Scale,
  Trash2,
  Weight,
} from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FormDialog } from "@/components/form/form-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { AppState } from "@/components/shared/app-state";

export type CattleTableRow = {
  id: string;
  identificationNumber: string;
  name: string | null;
  breed: string;
  gender: "Male" | "Female";
  purpose: "Breeding" | "Dairy" | "Meat";
  dateOfBirth: string;
  currentStatus: "Active" | "Sold" | "Deceased" | "Transferred";
  healthStatus: "Healthy" | "Sick" | "Recovering" | "NeedsCheckup";
  notes: string | null;
  color: string | null;
  weightRecords: {
    id: string;
    measuredAt: string;
    weightKg: number;
  }[];
  createdAt: string;
  updatedAt: string;
};

const columnLabels: Record<string, string> = {
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function displayEnum(value: string) {
  return value === "NeedsCheckup" ? "Needs Checkup" : value;
}

function getAge(value: string) {
  const birthDate = new Date(value);
  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();

  if (
    monthDelta < 0 ||
    (monthDelta === 0 && today.getDate() < birthDate.getDate())
  ) {
    years -= 1;
  }

  if (years > 0) {
    return `${years} yr`;
  }

  const months = Math.max(
    0,
    today.getMonth() -
      birthDate.getMonth() +
      12 * (today.getFullYear() - birthDate.getFullYear()),
  );

  return `${months} mo`;
}

function statusVariant(status: CattleTableRow["currentStatus"]) {
  if (status === "Active") {
    return "default";
  }

  if (status === "Sold" || status === "Transferred") {
    return "secondary";
  }

  return "destructive";
}

function healthVariant(health: CattleTableRow["healthStatus"]) {
  if (health === "Healthy") {
    return "default";
  }

  if (health === "Recovering") {
    return "secondary";
  }

  return "destructive";
}

function getLatestWeight(cattle: CattleTableRow) {
  return cattle.weightRecords[0] ?? null;
}

function getWeightDelta(cattle: CattleTableRow) {
  const latest = cattle.weightRecords[0];
  const previous = cattle.weightRecords[1];

  if (!latest || !previous) {
    return null;
  }

  return latest.weightKg - previous.weightKg;
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function CattleDetailMetric({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
}) {
  return (
    <div className="rounded-md border bg-background p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-base font-semibold">{value}</div>
      {detail ? (
        <div className="mt-1 text-xs text-muted-foreground">{detail}</div>
      ) : null}
    </div>
  );
}

function DetailSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-3 rounded-md border bg-background p-4">
      <div className="grid gap-0.5">
        <h3 className="text-sm font-semibold">{title}</h3>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid gap-1">
      <div className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
        {label}
      </div>
      <div className="min-w-0 text-sm text-foreground">{value}</div>
    </div>
  );
}

function WeightHistory({
  cattle,
  onDelete,
  deletingId,
}: {
  cattle: CattleTableRow;
  onDelete: (recordId: string) => void;
  deletingId: string | null;
}) {
  if (cattle.weightRecords.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
        No weight records yet.
      </div>
    );
  }

  const maxWeight = Math.max(
    ...cattle.weightRecords.map((record) => record.weightKg),
  );

  return (
    <div className="space-y-3">
      {cattle.weightRecords.map((record) => {
        const width = maxWeight > 0 ? (record.weightKg / maxWeight) * 100 : 0;

        return (
          <div key={record.id} className="grid gap-2 rounded-md border p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">
                  {formatDate(record.measuredAt)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Weight check
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm tabular-nums text-muted-foreground">
                  {record.weightKg.toLocaleString("en", {
                    maximumFractionDigits: 1,
                  })}{" "}
                  kg
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onDelete(record.id)}
                  disabled={deletingId === record.id}
                >
                  <Trash2 className="size-3.5" />
                  <span className="sr-only">Delete weight record</span>
                </Button>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CattleDetailDrawer({
  cattle,
  children,
}: {
  cattle: CattleTableRow;
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const latestWeight = getLatestWeight(cattle);
  const weightDelta = getWeightDelta(cattle);
  const [measuredAt, setMeasuredAt] = React.useState(todayInputValue);
  const [weightKg, setWeightKg] = React.useState("");
  const [isSavingWeight, setIsSavingWeight] = React.useState(false);
  const [deletingWeightId, setDeletingWeightId] = React.useState<string | null>(
    null,
  );

  async function addWeightRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingWeight(true);
    const toastId = toast.loading("Adding weight record...");

    try {
      const response = await fetch(`/api/cattle/${cattle.id}/weight-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          measuredAt,
          weightKg,
        }),
      });
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        toast.error(result?.message ?? "Unable to add weight record", {
          id: toastId,
        });
        return;
      }

      toast.success("Weight record added", { id: toastId });
      setWeightKg("");
      router.refresh();
    } catch {
      toast.error("Unable to add weight record", { id: toastId });
    } finally {
      setIsSavingWeight(false);
    }
  }

  async function deleteWeightRecord(recordId: string) {
    setDeletingWeightId(recordId);
    const toastId = toast.loading("Deleting weight record...");

    try {
      const response = await fetch(`/api/weight-records/${recordId}`, {
        method: "DELETE",
      });
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        toast.error(result?.message ?? "Unable to delete weight record", {
          id: toastId,
        });
        return;
      }

      toast.success("Weight record deleted", { id: toastId });
      router.refresh();
    } catch {
      toast.error("Unable to delete weight record", { id: toastId });
    } finally {
      setDeletingWeightId(null);
    }
  }

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="h-auto min-w-0 cursor-pointer px-0 text-left font-medium underline underline-offset-4 hover:text-primary"
        >
          <span className="truncate">{children}</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-2xl">
        <DrawerHeader className="px-5 pt-5 pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid min-w-0 gap-1">
              <DrawerTitle className="text-xl">
                {cattle.name || "Unnamed cattle"}
              </DrawerTitle>
              <DrawerDescription className="break-words">
                {cattle.identificationNumber} · {cattle.breed}
              </DrawerDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={statusVariant(cattle.currentStatus)}>
                {displayEnum(cattle.currentStatus)}
              </Badge>
              <Badge variant={healthVariant(cattle.healthStatus)}>
                {displayEnum(cattle.healthStatus)}
              </Badge>
            </div>
          </div>
        </DrawerHeader>

        <div className="grid gap-4 overflow-y-auto px-5 pb-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <CattleDetailMetric
              icon={<CalendarDays className="size-4" />}
              label="Age"
              value={getAge(cattle.dateOfBirth)}
              detail={formatDate(cattle.dateOfBirth)}
            />
            <CattleDetailMetric
              icon={<HeartPulse className="size-4" />}
              label="Health"
              value={displayEnum(cattle.healthStatus)}
              detail={`Status: ${displayEnum(cattle.currentStatus)}`}
            />
            <CattleDetailMetric
              icon={<Scale className="size-4" />}
              label="Latest Weight"
              value={
                latestWeight
                  ? `${latestWeight.weightKg.toLocaleString("en", {
                      maximumFractionDigits: 1,
                    })} kg`
                  : "Not recorded"
              }
              detail={
                latestWeight
                  ? `Measured ${formatDate(latestWeight.measuredAt)}`
                  : "Add a weight record to track growth"
              }
            />
            <CattleDetailMetric
              icon={<Weight className="size-4" />}
              label="Weight Change"
              value={
                weightDelta === null
                  ? "No trend"
                  : `${weightDelta > 0 ? "+" : ""}${weightDelta.toLocaleString(
                      "en",
                      { maximumFractionDigits: 1 },
                    )} kg`
              }
              detail={
                cattle.weightRecords.length > 1
                  ? "Compared with previous record"
                  : "Needs at least two records"
              }
            />
            <CattleDetailMetric
              icon={<ClipboardList className="size-4" />}
              label="Records"
              value={`${cattle.weightRecords.length} weight ${
                cattle.weightRecords.length === 1 ? "entry" : "entries"
              }`}
              detail={`Updated ${formatDate(cattle.updatedAt)}`}
            />
          </div>

          <DetailSection
            title="Profile"
            description="Core registration details for this animal."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailField label="Gender" value={displayEnum(cattle.gender)} />
              <DetailField
                label="Purpose"
                value={displayEnum(cattle.purpose)}
              />
              <DetailField
                label="Color"
                value={
                  <span className="inline-flex items-center gap-2">
                    <Palette className="size-4 text-muted-foreground" />
                    {cattle.color || "Not set"}
                  </span>
                }
              />
              <DetailField label="Breed" value={cattle.breed} />
              <DetailField
                label="Registered"
                value={formatDate(cattle.createdAt)}
              />
              <DetailField
                label="Last Updated"
                value={formatDate(cattle.updatedAt)}
              />
            </div>
          </DetailSection>

          <DetailSection
            title="Notes"
            description="Handling, care, or farm observations saved with this record."
          >
            {cattle.notes?.trim() ? (
              <div className="rounded-md bg-muted/40 p-3 text-sm leading-6 text-foreground">
                {cattle.notes.trim()}
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                No notes recorded yet.
              </div>
            )}
          </DetailSection>

          <DetailSection
            title="Weight History"
            description={`${cattle.weightRecords.length} record${
              cattle.weightRecords.length === 1 ? "" : "s"
            } saved for this animal.`}
          >
            <form
              onSubmit={addWeightRecord}
              className="grid gap-3 rounded-md bg-muted/30 p-3 sm:grid-cols-[1fr_1fr_auto]"
            >
              <div className="grid gap-1.5">
                <Label htmlFor={`${cattle.id}-weight-date`}>Date</Label>
                <Input
                  id={`${cattle.id}-weight-date`}
                  type="date"
                  value={measuredAt}
                  onChange={(event) => setMeasuredAt(event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={`${cattle.id}-weight-kg`}>Weight kg</Label>
                <Input
                  id={`${cattle.id}-weight-kg`}
                  type="number"
                  min="1"
                  step="0.1"
                  value={weightKg}
                  onChange={(event) => setWeightKg(event.target.value)}
                  placeholder="420.5"
                  required
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={isSavingWeight}
                >
                  <Plus className="size-4" />
                  {isSavingWeight ? "Adding..." : "Add"}
                </Button>
              </div>
            </form>

            <WeightHistory
              cattle={cattle}
              onDelete={(recordId) => void deleteWeightRecord(recordId)}
              deletingId={deletingWeightId}
            />
          </DetailSection>
        </div>

        <DrawerFooter className="px-5 pt-3">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
            <FormDialog
              type="edit"
              id={cattle.id}
              triggerLabel="Edit Record"
              defaultValues={{
                identificationNumber: cattle.identificationNumber,
                name: cattle.name ?? "",
                breed: cattle.breed,
                gender: cattle.gender,
                purpose: cattle.purpose,
                dateOfBirth: cattle.dateOfBirth.slice(0, 10),
                currentStatus: cattle.currentStatus,
                healthStatus: cattle.healthStatus,
                notes: cattle.notes ?? "",
                color: cattle.color ?? "",
              }}
            />
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ActionsCell({ cattle }: { cattle: CattleTableRow }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  async function deleteCattle() {
    setIsDeleting(true);
    const toastId = toast.loading("Deleting cattle record...");

    try {
      const response = await fetch(`/api/cattle/${cattle.id}`, {
        method: "DELETE",
      });
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        toast.error(result?.message ?? "Unable to delete cattle record", {
          id: toastId,
        });
        return;
      }

      toast.success("Cattle record deleted", { id: toastId });
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Unable to delete cattle record", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex justify-end gap-2">
      <FormDialog
        type="edit"
        id={cattle.id}
        triggerLabel="Edit"
        defaultValues={{
          identificationNumber: cattle.identificationNumber,
          name: cattle.name ?? "",
          breed: cattle.breed,
          gender: cattle.gender,
          purpose: cattle.purpose,
          dateOfBirth: cattle.dateOfBirth.slice(0, 10),
          currentStatus: cattle.currentStatus,
          healthStatus: cattle.healthStatus,
          notes: cattle.notes ?? "",
          color: cattle.color ?? "",
        }}
      />

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Trash2 className="mr-2 size-4" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete cattle record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              {cattle.name || cattle.identificationNumber} from your herd
              records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();
                void deleteCattle();
              }}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const columns: ColumnDef<CattleTableRow>[] = [
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
    cell: ({ row }) => <ActionsCell cattle={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];

export function DataTable({ data }: { data: CattleTableRow[] }) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "identificationNumber", desc: false },
  ]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      pagination,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {table.getFilteredRowModel().rows.length} cattle record
          {table.getFilteredRowModel().rows.length === 1 ? "" : "s"}.
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Columns3 />
              Columns
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {table
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !== "undefined" &&
                  column.getCanHide(),
              )
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {columnLabels[column.id] ?? column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="**:data-[slot=table-cell]:first:w-8">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  <AppState
                    type="empty"
                    title="No cattle records found"
                    description="Create your first cattle record to start tracking herd details, health, and weight history."
                    action={{
                      label: "Create Cattle",
                      href: "/cattle?create=true",
                    }}
                    className="min-h-80 border-0"
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} selected.
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount() || 1}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="hidden size-8 p-0 sm:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 sm:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
