import { DetectEntities } from "skyflow-node";

/**
 * All supported entity types as a union type
 */
export type EntityType =
  | "age"
  | "bank_account"
  | "credit_card"
  | "credit_card_expiration"
  | "cvv"
  | "date"
  | "date_interval"
  | "dob"
  | "driver_license"
  | "email_address"
  | "healthcare_number"
  | "ip_address"
  | "location"
  | "name"
  | "numerical_pii"
  | "phone_number"
  | "ssn"
  | "url"
  | "vehicle_id"
  | "medical_code"
  | "name_family"
  | "name_given"
  | "account_number"
  | "event"
  | "filename"
  | "gender"
  | "language"
  | "location_address"
  | "location_city"
  | "location_coordinate"
  | "location_country"
  | "location_state"
  | "location_zip"
  | "marital_status"
  | "money"
  | "name_medical_professional"
  | "occupation"
  | "organization"
  | "organization_medical_facility"
  | "origin"
  | "passport_number"
  | "password"
  | "physical_attribute"
  | "political_affiliation"
  | "religion"
  | "time"
  | "username"
  | "zodiac_sign"
  | "blood_type"
  | "condition"
  | "dose"
  | "drug"
  | "injury"
  | "medical_process"
  | "statistics"
  | "routing_number"
  | "corporate_action"
  | "financial_metric"
  | "product"
  | "trend"
  | "duration"
  | "location_address_street"
  | "all"
  | "sexuality"
  | "effect"
  | "project"
  | "organization_id"
  | "day"
  | "month";

/**
 * Array of all entity type strings for schema validation
 */
export const ENTITY_TYPES: EntityType[] = [
  "age",
  "bank_account",
  "credit_card",
  "credit_card_expiration",
  "cvv",
  "date",
  "date_interval",
  "dob",
  "driver_license",
  "email_address",
  "healthcare_number",
  "ip_address",
  "location",
  "name",
  "numerical_pii",
  "phone_number",
  "ssn",
  "url",
  "vehicle_id",
  "medical_code",
  "name_family",
  "name_given",
  "account_number",
  "event",
  "filename",
  "gender",
  "language",
  "location_address",
  "location_city",
  "location_coordinate",
  "location_country",
  "location_state",
  "location_zip",
  "marital_status",
  "money",
  "name_medical_professional",
  "occupation",
  "organization",
  "organization_medical_facility",
  "origin",
  "passport_number",
  "password",
  "physical_attribute",
  "political_affiliation",
  "religion",
  "time",
  "username",
  "zodiac_sign",
  "blood_type",
  "condition",
  "dose",
  "drug",
  "injury",
  "medical_process",
  "statistics",
  "routing_number",
  "corporate_action",
  "financial_metric",
  "product",
  "trend",
  "duration",
  "location_address_street",
  "all",
  "sexuality",
  "effect",
  "project",
  "organization_id",
  "day",
  "month",
];

/**
 * Type-safe mapping from string entity names to DetectEntities enum values
 */
export const ENTITY_MAP: Record<EntityType, DetectEntities> = {
  age: DetectEntities.AGE,
  bank_account: DetectEntities.BANK_ACCOUNT,
  credit_card: DetectEntities.CREDIT_CARD,
  credit_card_expiration: DetectEntities.CREDIT_CARD_EXPIRATION,
  cvv: DetectEntities.CVV,
  date: DetectEntities.DATE,
  date_interval: DetectEntities.DATE_INTERVAL,
  dob: DetectEntities.DOB,
  driver_license: DetectEntities.DRIVER_LICENSE,
  email_address: DetectEntities.EMAIL_ADDRESS,
  healthcare_number: DetectEntities.HEALTHCARE_NUMBER,
  ip_address: DetectEntities.IP_ADDRESS,
  location: DetectEntities.LOCATION,
  name: DetectEntities.NAME,
  numerical_pii: DetectEntities.NUMERICAL_PII,
  phone_number: DetectEntities.PHONE_NUMBER,
  ssn: DetectEntities.SSN,
  url: DetectEntities.URL,
  vehicle_id: DetectEntities.VEHICLE_ID,
  medical_code: DetectEntities.MEDICAL_CODE,
  name_family: DetectEntities.NAME_FAMILY,
  name_given: DetectEntities.NAME_GIVEN,
  account_number: DetectEntities.ACCOUNT_NUMBER,
  event: DetectEntities.EVENT,
  filename: DetectEntities.FILENAME,
  gender: DetectEntities.GENDER,
  language: DetectEntities.LANGUAGE,
  location_address: DetectEntities.LOCATION_ADDRESS,
  location_city: DetectEntities.LOCATION_CITY,
  location_coordinate: DetectEntities.LOCATION_COORDINATE,
  location_country: DetectEntities.LOCATION_COUNTRY,
  location_state: DetectEntities.LOCATION_STATE,
  location_zip: DetectEntities.LOCATION_ZIP,
  marital_status: DetectEntities.MARITAL_STATUS,
  money: DetectEntities.MONEY,
  name_medical_professional: DetectEntities.NAME_MEDICAL_PROFESSIONAL,
  occupation: DetectEntities.OCCUPATION,
  organization: DetectEntities.ORGANIZATION,
  organization_medical_facility: DetectEntities.ORGANIZATION_MEDICAL_FACILITY,
  origin: DetectEntities.ORIGIN,
  passport_number: DetectEntities.PASSPORT_NUMBER,
  password: DetectEntities.PASSWORD,
  physical_attribute: DetectEntities.PHYSICAL_ATTRIBUTE,
  political_affiliation: DetectEntities.POLITICAL_AFFILIATION,
  religion: DetectEntities.RELIGION,
  time: DetectEntities.TIME,
  username: DetectEntities.USERNAME,
  zodiac_sign: DetectEntities.ZODIAC_SIGN,
  blood_type: DetectEntities.BLOOD_TYPE,
  condition: DetectEntities.CONDITION,
  dose: DetectEntities.DOSE,
  drug: DetectEntities.DRUG,
  injury: DetectEntities.INJURY,
  medical_process: DetectEntities.MEDICAL_PROCESS,
  statistics: DetectEntities.STATISTICS,
  routing_number: DetectEntities.ROUTING_NUMBER,
  corporate_action: DetectEntities.CORPORATE_ACTION,
  financial_metric: DetectEntities.FINANCIAL_METRIC,
  product: DetectEntities.PRODUCT,
  trend: DetectEntities.TREND,
  duration: DetectEntities.DURATION,
  location_address_street: DetectEntities.LOCATION_ADDRESS_STREET,
  all: DetectEntities.ALL,
  sexuality: DetectEntities.SEXUALITY,
  effect: DetectEntities.EFFECT,
  project: DetectEntities.PROJECT,
  organization_id: DetectEntities.ORGANIZATION_ID,
  day: DetectEntities.DAY,
  month: DetectEntities.MONTH,
};

/**
 * Check if an entity type is valid
 */
export function isValidEntity(entity: string): entity is EntityType {
  return entity in ENTITY_MAP;
}

/**
 * Get the DetectEntities enum value for a string entity name
 * @throws Error if the entity type is invalid
 */
export function getEntityEnum(entity: EntityType): DetectEntities {
  const entityEnum = ENTITY_MAP[entity];
  if (!entityEnum) {
    throw new Error(`Invalid entity type: ${entity}`);
  }
  return entityEnum;
}
