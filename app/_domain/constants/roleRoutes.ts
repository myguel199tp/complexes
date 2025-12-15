import { route } from "./routes";
import { UserRole } from "../types/jwt-payload";

export const roleRoutes: Record<UserRole, readonly string[]> = {
  [UserRole.OWNER]: [
    route.mydocuemnts,
    route.myprofile,
    route.mysocial,
    route.myadd,
    route.mynewimmovable,
    route.myholliday,
    route.mypqr,
    route.myforum,
    route.myallassembly,
    route.ensemble,
    route.myvip,
    route.myAdvertisement,
    route.myConvention,
    route.myfavorites,
    route.myvacations,
    route.mylocatario,
  ],

  [UserRole.EMPLOYEE]: [
    route.mynews,
    route.news,
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
    route.ensemble,
    route.myvip,
    route.myConvention,
  ],

  [UserRole.TENANT]: [
    route.ensemble,
    route.myprofile,
    route.mysocial,
    route.myvip,
    route.myAdvertisement,
  ],

  [UserRole.RESIDENT]: [route.ensemble],

  [UserRole.VISITOR]: [route.ensemble],

  [UserRole.USER]: [route.ensemble],

  [UserRole.FAMILY]: [route.ensemble],

  [UserRole.PORTER]: [route.ensemble],

  [UserRole.CLEANER]: [route.ensemble],

  [UserRole.MAINTENANCE]: [route.ensemble],

  [UserRole.GARDENER]: [route.ensemble],

  [UserRole.POOL_TECH]: [route.ensemble],

  [UserRole.ACCOUNTANT]: [route.ensemble],

  [UserRole.MESSENGER]: [route.ensemble],

  [UserRole.LOGISTICS_ASSISTANT]: [route.ensemble],

  [UserRole.COMMUNITY_MANAGER]: [route.ensemble],

  [UserRole.TRAINER]: [route.ensemble],

  [UserRole.EVENT_STAFF]: [route.ensemble],
};
