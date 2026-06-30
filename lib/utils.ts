import type { CattleTableRow } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function displayEnum(value: string) {
  return value === "NeedsCheckup" ? "Needs Checkup" : value;
}

export function getAge(value: string) {
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

export function statusVariant(status: CattleTableRow["currentStatus"]) {
  if (status === "Active") {
    return "default";
  }

  if (status === "Sold" || status === "Transferred") {
    return "secondary";
  }

  return "destructive";
}

export function healthVariant(health: CattleTableRow["healthStatus"]) {
  if (health === "Healthy") {
    return "default";
  }

  if (health === "Recovering") {
    return "secondary";
  }

  return "destructive";
}

export function getLatestWeight(cattle: CattleTableRow) {
  return cattle.weightRecords[0] ?? null;
}

export function getWeightDelta(cattle: CattleTableRow) {
  const latest = cattle.weightRecords[0];
  const previous = cattle.weightRecords[1];

  if (!latest || !previous) {
    return null;
  }

  return latest.weightKg - previous.weightKg;
}

export function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}
