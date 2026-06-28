import "dotenv/config";

import { PrismaNeon } from "@prisma/adapter-neon";

import { PrismaClient } from "../app/generated/prisma/client";

type SeedCattle = {
  identificationNumber: string;
  name: string;
  breed: string;
  gender: "Male" | "Female";
  purpose: "Breeding" | "Dairy" | "Meat";
  dateOfBirth: Date;
  currentStatus: "Active" | "Sold" | "Deceased" | "Transferred";
  healthStatus: "Healthy" | "Sick" | "Recovering" | "NeedsCheckup";
  color: string;
  notes: string;
  weightRecords: {
    measuredAt: Date;
    weightKg: number;
  }[];
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

const meatBreeds = [
  "Angus",
  "Hereford",
  "Charolais",
  "Limousin",
  "Simmental",
  "Brahman",
];
const dairyBreeds = [
  "Holstein",
  "Jersey",
  "Guernsey",
  "Ayrshire",
  "Brown Swiss",
];
const breedingBreeds = [
  "Brahman",
  "Angus",
  "Simmental",
  "Hereford",
  "Gelbvieh",
];
const colors = [
  "Black",
  "Red",
  "Brown",
  "White",
  "Black and white",
  "Red and white",
  "Cream",
  "Gray",
];
const names = [
  "Bella",
  "Daisy",
  "Molly",
  "Luna",
  "Ruby",
  "Rosie",
  "Willow",
  "Hazel",
  "Bruno",
  "Atlas",
  "Ranger",
  "Duke",
  "Gunner",
  "Titan",
  "Scout",
  "Maverick",
  "Pearl",
  "Nora",
  "Maple",
  "Clover",
];

function monthsAgo(months: number, dayOffset = 0) {
  const date = new Date("2026-06-01T00:00:00.000Z");
  date.setUTCMonth(date.getUTCMonth() - months);
  date.setUTCDate(Math.max(1, date.getUTCDate() + dayOffset));
  return date;
}

function yearsAgo(years: number, extraMonths = 0) {
  return monthsAgo(years * 12 + extraMonths);
}

function roundWeight(value: number) {
  return Math.round(value * 10) / 10;
}

function buildWeightRecords(
  purpose: SeedCattle["purpose"],
  index: number,
): SeedCattle["weightRecords"] {
  const recordCount =
    purpose === "Meat" ? 7 + (index % 3) : purpose === "Dairy" ? 4 : 3;
  const intervalMonths = purpose === "Meat" ? 1 : purpose === "Dairy" ? 2 : 3;
  const baseWeight =
    purpose === "Meat"
      ? 260 + index * 5
      : purpose === "Dairy"
        ? 330 + index * 3
        : 300 + index * 4;
  const gainPerRecord =
    purpose === "Meat"
      ? 18 + (index % 5)
      : purpose === "Dairy"
        ? 7 + (index % 4)
        : 9 + (index % 3);

  return Array.from({ length: recordCount }, (_, recordIndex) => {
    const newestFirstIndex = recordCount - recordIndex - 1;

    return {
      measuredAt: monthsAgo(newestFirstIndex * intervalMonths, index % 9),
      weightKg: roundWeight(
        baseWeight + recordIndex * gainPerRecord + (recordIndex % 2) * 2.4,
      ),
    };
  });
}

function purposeForIndex(index: number): SeedCattle["purpose"] {
  if (index <= 20) {
    return "Meat";
  }

  if (index <= 35) {
    return "Dairy";
  }

  return "Breeding";
}

function breedForPurpose(purpose: SeedCattle["purpose"], index: number) {
  const breeds =
    purpose === "Meat"
      ? meatBreeds
      : purpose === "Dairy"
        ? dairyBreeds
        : breedingBreeds;

  return breeds[index % breeds.length];
}

function buildSeedCattle(): SeedCattle[] {
  return Array.from({ length: 50 }, (_, zeroIndex) => {
    const index = zeroIndex + 1;
    const purpose = purposeForIndex(index);
    const gender = index % 5 === 0 || purpose === "Meat" ? "Male" : "Female";
    const healthStatus =
      index % 17 === 0
        ? "NeedsCheckup"
        : index % 13 === 0
          ? "Recovering"
          : index % 11 === 0
            ? "Sick"
            : "Healthy";
    const currentStatus =
      index % 23 === 0 ? "Transferred" : index % 19 === 0 ? "Sold" : "Active";
    const breed = breedForPurpose(purpose, index);
    const weightRecords = buildWeightRecords(purpose, index);
    const latestWeight = weightRecords.at(-1)?.weightKg;

    return {
      identificationNumber: `SEED-${index.toString().padStart(3, "0")}`,
      name: `${names[index % names.length]} ${index}`,
      breed,
      gender,
      purpose,
      dateOfBirth:
        purpose === "Meat"
          ? yearsAgo(1, index % 8)
          : purpose === "Dairy"
            ? yearsAgo(3, index % 10)
            : yearsAgo(2, index % 14),
      currentStatus,
      healthStatus,
      color: colors[index % colors.length],
      notes:
        purpose === "Meat"
          ? `Meat herd record. Track weight closely; latest seeded weight is ${latestWeight} kg.`
          : purpose === "Dairy"
            ? "Dairy herd record. Monitor condition, milk productivity, and regular health checks."
            : "Breeding herd record. Keep notes on temperament, lineage, and breeding readiness.",
      weightRecords,
    };
  });
}

async function main() {
  const seedCattle = buildSeedCattle();

  for (const cattle of seedCattle) {
    await prisma.cattle.upsert({
      where: {
        identificationNumber: cattle.identificationNumber,
      },
      create: {
        identificationNumber: cattle.identificationNumber,
        name: cattle.name,
        breed: cattle.breed,
        gender: cattle.gender,
        purpose: cattle.purpose,
        dateOfBirth: cattle.dateOfBirth,
        currentStatus: cattle.currentStatus,
        healthStatus: cattle.healthStatus,
        color: cattle.color,
        notes: cattle.notes,
        weightRecords: {
          create: cattle.weightRecords,
        },
      },
      update: {
        name: cattle.name,
        breed: cattle.breed,
        gender: cattle.gender,
        purpose: cattle.purpose,
        dateOfBirth: cattle.dateOfBirth,
        currentStatus: cattle.currentStatus,
        healthStatus: cattle.healthStatus,
        color: cattle.color,
        notes: cattle.notes,
        weightRecords: {
          deleteMany: {},
          create: cattle.weightRecords,
        },
      },
    });
  }

  const counts = await prisma.cattle.groupBy({
    by: ["purpose"],
    where: {
      identificationNumber: {
        startsWith: "SEED-",
      },
    },
    _count: {
      _all: true,
    },
  });
  const weightRecordCount = await prisma.weightRecord.count({
    where: {
      cattle: {
        identificationNumber: {
          startsWith: "SEED-",
        },
      },
    },
  });

  console.log(
    JSON.stringify(
      {
        cattle: seedCattle.length,
        weightRecords: weightRecordCount,
        byPurpose: counts.map((count) => ({
          purpose: count.purpose,
          cattle: count._count._all,
        })),
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
