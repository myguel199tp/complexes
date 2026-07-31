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
