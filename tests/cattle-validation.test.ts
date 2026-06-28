import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  cattleFormSchema,
  weightRecordSchema,
} from "@/lib/validation/cattle-form-schema";

describe("cattle validation", () => {
  it("accepts a complete cattle form payload", () => {
    const result = cattleFormSchema.safeParse({
      identificationNumber: "C-1001",
      name: "Bella",
      breed: "Holstein",
      gender: "Female",
      purpose: "Dairy",
      dateOfBirth: "2023-04-15",
      currentStatus: "Active",
      healthStatus: "Healthy",
      notes: "Calm animal with regular checks.",
      color: "Black and white",
      weightRecords: [],
    });

    assert.equal(result.success, true);
  });

  it("rejects an invalid cattle purpose", () => {
    const result = cattleFormSchema.safeParse({
      identificationNumber: "C-1002",
      name: "Ranger",
      breed: "Angus",
      gender: "Male",
      purpose: "Racing",
      dateOfBirth: "2024-01-10",
      currentStatus: "Active",
      healthStatus: "Healthy",
      notes: "",
      color: "Black",
      weightRecords: [],
    });

    assert.equal(result.success, false);
  });

  it("requires a positive weight record value", () => {
    const result = weightRecordSchema.safeParse({
      measuredAt: "2026-06-28",
      weightKg: 0,
    });

    assert.equal(result.success, false);
  });
});
