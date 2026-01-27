import { route } from "./routes";
import { UserRole } from "../types/jwt-payload";

const BASE_ROUTES = [route.ensemble] as const;

export const roleRoutes: Record<UserRole, readonly string[]> = {
  [UserRole.OWNER]: [
    ...BASE_ROUTES,
    route.mydocuemnts,
    route.myprofile,
    route.mysocial,
    route.myadd,
    route.mynewimmovable,
    route.myholliday,
    route.mypqr,
    route.myforum,
    route.myvip,
    route.myAdvertisement,
    route.myConvention,
    route.myfavorites,
    route.myvacations,
    route.mylocatario,
    route.myreferal,
    route.myExternal,
  ],

  [UserRole.EMPLOYEE]: [
    ...BASE_ROUTES,
    route.mynews,
    route.news,
    route.payComplexes,
    route.myprofile,
    route.myactivity,
    route.activity,
    route.mycitofonia,
    route.citofonia,
    route.certification,
    route.mycertification,
    route.myforo,
    route.foro,
    route.myuser,
    route.user,
    route.myworker,
    route.worker,
    route.myAllPqr,
    route.myAssembly,
    route.assembly,
    route.myvip,
    route.myConvention,
    route.myMaintanance,
    route.myreferal,
    route.mylocals,
    route.areaMaintenace,
    route.areaProveedor,
    route.areAllMaintenance,
    route.maintenaceResult,
    route.areaMaintenaceResult,
    route.areaProveedorResult,
  ],

  [UserRole.TENANT]: [
    ...BASE_ROUTES,
    route.myprofile,
    route.mysocial,
    route.myvip,
    route.myAdvertisement,
  ],

  [UserRole.RESIDENT]: BASE_ROUTES,

  [UserRole.VISITOR]: BASE_ROUTES,

  [UserRole.USER]: [...BASE_ROUTES, route.myholliday],

  [UserRole.FAMILY]: [...BASE_ROUTES, route.myreferal],

  [UserRole.PORTER]: [
    ...BASE_ROUTES,
    route.myreferal,
    route.myprofile,
    route.myvip,
    route.mycitofonia,
  ],

  [UserRole.CLEANER]: [...BASE_ROUTES, route.myreferal],

  [UserRole.MAINTENANCE]: [...BASE_ROUTES, route.myreferal],

  [UserRole.GARDENER]: [...BASE_ROUTES, route.myreferal],

  [UserRole.POOL_TECH]: [...BASE_ROUTES, route.myreferal],

  [UserRole.ACCOUNTANT]: BASE_ROUTES,

  [UserRole.MESSENGER]: BASE_ROUTES,

  [UserRole.LOGISTICS_ASSISTANT]: BASE_ROUTES,

  [UserRole.COMMUNITY_MANAGER]: BASE_ROUTES,

  [UserRole.TRAINER]: BASE_ROUTES,

  [UserRole.EVENT_STAFF]: BASE_ROUTES,
};
