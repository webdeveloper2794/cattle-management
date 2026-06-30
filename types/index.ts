export type CattleFilterValues = {
  q: string;
  gender: string;
  purpose: string;
  status: string;
  health: string;
};
export type CattleSearchParams = Partial<
  Record<keyof CattleFilterValues | "page" | "pageSize", string>
>;

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

export type DashboardStats = {
  totalCattle: number;
  activeCattle: number;
  healthAlerts: number;
  meatCattle: number;
  dairyCattle: number;
  breedingCattle: number;
  weightRecords: number;
};

export type WeightActivityPoint = {
  month: string;
  records: number;
};

export type PurposeChartPoint = {
  purpose: string;
  count: number;
};
