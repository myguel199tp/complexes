export enum UserRole {
  OWNER = "owner",
  TENANT = "tenant",
  RESIDENT = "resident",
  VISITOR = "visitor",
  USER = "user",
  FAMILY = "family",
  EMPLOYEE = "employee",
  PORTER = "porter",
  CLEANER = "cleaner",
  MAINTENANCE = "maintenance",
  GARDENER = "gardener",
  POOL_TECH = "pool_technician",
  ACCOUNTANT = "accountant",
  MESSENGER = "messenger",
  LOGISTICS_ASSISTANT = "logistics_assistant",
  COMMUNITY_MANAGER = "community_manager",
  TRAINER = "trainer",
  EVENT_STAFF = "event_staff",
}

export interface JWTPayload {
  sub: string;
  roles: UserRole[];
  isActive: boolean;
  exp: number;
  iat?: number;
}
