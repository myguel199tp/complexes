/**
 * Roles del conjunto que gestionan el consejo: inicializarlo, asignar cargos y
 * agregar o quitar miembros. El backend lo vuelve a comprobar; aquí solo sirve
 * para no mostrar controles que responderían 403.
 */
export const COUNCIL_MANAGER_ROLES = ["employee", "admin", "manager"];

export function canManageCouncil(role: string | null | undefined) {
  return COUNCIL_MANAGER_ROLES.includes(role ?? "");
}
