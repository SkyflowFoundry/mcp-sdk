import { describe, it, expect } from "vitest";
import {
  ENTITY_MAP,
  ENTITY_TYPES,
  isValidEntity,
  getEntityEnum,
} from "../../../src/utils/entityMaps.js";

describe("ENTITY_MAP", () => {
  it("should contain expected entity types", () => {
    expect(ENTITY_MAP.email_address).toBeDefined();
    expect(ENTITY_MAP.ssn).toBeDefined();
    expect(ENTITY_MAP.credit_card).toBeDefined();
    expect(ENTITY_MAP.phone_number).toBeDefined();
    expect(ENTITY_MAP.name).toBeDefined();
  });

  it("should have matching keys in ENTITY_TYPES array", () => {
    const mapKeys = Object.keys(ENTITY_MAP);
    expect(mapKeys.length).toBe(ENTITY_TYPES.length);
    mapKeys.forEach((key) => {
      expect(ENTITY_TYPES).toContain(key);
    });
  });
});

describe("isValidEntity", () => {
  it("should return true for valid entities", () => {
    expect(isValidEntity("email_address")).toBe(true);
    expect(isValidEntity("ssn")).toBe(true);
    expect(isValidEntity("credit_card")).toBe(true);
  });

  it("should return false for invalid entities", () => {
    expect(isValidEntity("invalid_entity")).toBe(false);
    expect(isValidEntity("")).toBe(false);
    expect(isValidEntity("EMAIL_ADDRESS")).toBe(false); // case sensitive
  });
});

describe("getEntityEnum", () => {
  it("should return enum value for valid entity", () => {
    const result = getEntityEnum("email_address");
    expect(result).toBeDefined();
  });

  it("should throw for invalid entity", () => {
    expect(() => getEntityEnum("invalid" as never)).toThrow(
      "Invalid entity type: invalid"
    );
  });
});
