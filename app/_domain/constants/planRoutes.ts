import { route } from "./routes";
import { PlanFeatures } from "@/app/hooks/usePlanFeatures";

/** Función del plan que habilita una ruta; `plan` es el nombre, no un permiso. */
type PlanFeatureKey = Exclude<keyof PlanFeatures, "plan">;

/**
 * Módulos del panel que dependen del plan del conjunto.
 *
 * Vive aparte de `roleRoutes` porque son dos filtros distintos: el rol se
 * resuelve con los claims del token y lo aplica el middleware, mientras que el
 * plan hay que consultarlo al backend, así que se filtra en el cliente —en el
 * sidebar y en la propia pantalla—. La regla de qué incluye cada plan sigue
 * siendo del backend (`planFeatures()`); aquí solo se dice qué ruta pertenece a
 * qué función.
 */
export const PLAN_GATED_ROUTES: ReadonlyArray<{
  prefix: string;
  feature: PlanFeatureKey;
}> = [
  // El foro son dos rutas: donde se crea el tema y donde se listan y se abren.
  { prefix: route.myforo, feature: "forum" },
  { prefix: route.myforum, feature: "forum" },
  { prefix: route.mylocals, feature: "commercialLocals" },
  // Las grabaciones cuelgan de /my-cameras, así que el prefijo las cubre.
  { prefix: route.myCameras, feature: "cameras" },
  // La asamblea son dos pantallas: la convocatoria y la votación.
  { prefix: route.myAssembly, feature: "assembly" },
  { prefix: route.myConvention, feature: "assembly" },
  { prefix: route.mycouncil, feature: "council" },
];

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

/**
 * Qué función del plan hace falta para esta ruta, o `null` si no depende del
 * plan.
 */
export function planFeatureForRoute(pathname: string): PlanFeatureKey | null {
  const gated = PLAN_GATED_ROUTES.find((item) =>
    matchesPrefix(pathname, item.prefix),
  );

  return gated?.feature ?? null;
}

/** Si el plan del conjunto cubre la ruta. Lo que no está listado, pasa. */
export function isRouteAllowedByPlan(
  pathname: string,
  features: PlanFeatures,
): boolean {
  const feature = planFeatureForRoute(pathname);

  return feature === null || features[feature];
}
