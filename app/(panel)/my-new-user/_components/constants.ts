export const optionsRol = [{ value: "owner", label: "Dueño de apartamento" }];
export enum UserRole {
  EMPLOYEE = "employee",
  PORTER = "porter",
  CLEANER = "cleaner",
  MAINTENANCE = "maintenance",
  GARDENER = "gardener",
  POOL_TECH = "pool_technician",
  ACCOUNTANT = "accountant",
}

// Roles de personal: no pueden recibir multas, pagos, certificaciones ni transferencias
export const STAFF_ROLES: string[] = Object.values(UserRole);

export const isStaffRole = (role?: string) =>
  !!role && STAFF_ROLES.includes(role);

// Roles mostrados en el tab "Todos los colaboradores"
export const WORKER_ROLES: string[] = [
  "porter",
  "cleaner",
  "maintenance",
  "gardener",
  "pool_technician",
  "accountant",
  "messenger",
  "logistics_assistant",
  "community_manager",
  "trainer",
  "event_staff",
];

export const isWorkerRole = (role?: string) =>
  !!role && WORKER_ROLES.includes(role);
