import { route } from "./routes";
import { UserRole } from "../types/jwt-payload";

// Cualquier residente puede emitir un pase para su propia unidad; el backend
// resuelve contra la relación usuario–conjunto a qué apartamento pertenece.
const BASE_ROUTES = [route.ensemble, route.myAccessPass] as const;

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
    route.allexternal,
    route.holiday,
    route.mycouncil,
    route.myStore,
    route.storeComercio,
    route.myStoreOrders,
    route.myOrders,
    route.mySales,
  ],

  [UserRole.EMPLOYEE]: [
    ...BASE_ROUTES,
    route.mynews,
    route.news,
    route.payComplexes,
    route.myprofile,
    route.myactivity,
    route.myActivityScan,
    route.activity,
    route.mycitofonia,
    route.citofonia,
    route.myDeliveryAccess,
    route.myEvacuation,
    route.myCameras,
    // Sin equivalente en PORTER: rebobinar días de video es investigación,
    // no operación de portería.
    route.myCameraRecordings,
    route.certification,
    route.mycertification,
    route.myforo,
    route.foro,
    // El listado de /my-foro enlaza al detalle en /my-all-foro/foroall/[id];
    // sin esta ruta el empleado ve los temas pero no puede abrirlos.
    route.myforum,
    route.myuser,
    route.user,
    route.myworker,
    route.worker,
    route.myAllPqr,
    route.myAssembly,
    route.myvip,
    route.myConvention,
    route.myMaintanance,
    route.myreferal,
    route.mylocals,
    route.locals,
    route.areaMaintenace,
    route.areaProveedor,
    route.areAllMaintenance,
    route.maintenaceResult,
    route.areaMaintenaceResult,
    route.areaProveedorResult,
    route.myBills,
    route.myfees,
    route.feees,
    route.mycouncil,
    route.myEmergency,
    route.myParking,
    // Mantiene lo que el asistente sabe de este conjunto. Lo escrito ahí sale
    // después por boca del asistente, así que lo abren los mismos roles que
    // administran el edificio y ninguno más.
    route.myAssistantKnowledge,
  ],

  [UserRole.TENANT]: [
    ...BASE_ROUTES,
    route.myprofile,
    route.mysocial,
    route.myvip,
    route.myAdvertisement,
    route.mycontrac,
    route.myStore,
    route.storeComercio,
    route.myStoreOrders,
    route.myOrders,
    route.mySales,
  ],

  // Reservar actividades es de residentes e invitados de una unidad. El backend
  // los admite en `/reservation-activity`, pero sin la ruta aquí el panel les
  // cerraba la pantalla desde la que se reserva.
  [UserRole.RESIDENT]: [...BASE_ROUTES, route.mysocial, route.myvip],

  [UserRole.VISITOR]: [...BASE_ROUTES, route.mysocial, route.myvip],

  [UserRole.USER]: [...BASE_ROUTES, route.myholliday],

  [UserRole.FAMILY]: [
    ...BASE_ROUTES,
    route.myreferal,
    route.mysocial,
    route.myvip,
  ],

  [UserRole.PORTER]: [
    ...BASE_ROUTES,
    route.myreferal,
    route.myprofile,
    route.myvip,
    route.mycitofonia,
    route.myDeliveryAccess,
    // La lista de evacuación también la abre la brigada; el backend valida.
    route.myEvacuation,
    route.myActivityScan,
    route.myCameras,
  ],

  [UserRole.CLEANER]: [
    ...BASE_ROUTES,
    route.myreferal,
    route.myprofile,
    route.myActivityScan,
    route.myvip,
  ],

  [UserRole.MAINTENANCE]: [
    ...BASE_ROUTES,
    route.myreferal,
    route.myprofile,
    route.myActivityScan,
    route.myvip,
  ],

  [UserRole.GARDENER]: [
    ...BASE_ROUTES,
    route.myreferal,
    route.myprofile,
    route.myActivityScan,
    route.myvip,
  ],

  [UserRole.POOL_TECH]: [
    ...BASE_ROUTES,
    route.myreferal,
    route.myprofile,
    route.myActivityScan,
    route.myvip,
  ],

  [UserRole.ACCOUNTANT]: [
    ...BASE_ROUTES,
    route.myreferal,
    route.myprofile,
    route.myActivityScan,
    route.myvip,
    route.myAssistantKnowledge,
  ],

  [UserRole.MESSENGER]: [
    ...BASE_ROUTES,
    route.myreferal,
    route.myprofile,
    route.myActivityScan,
    route.myvip,
  ],

  [UserRole.LOGISTICS_ASSISTANT]: [
    ...BASE_ROUTES,
    route.myreferal,
    route.myprofile,
    route.myActivityScan,
    route.myvip,
  ],

  [UserRole.COMMUNITY_MANAGER]: [
    ...BASE_ROUTES,
    route.myreferal,
    route.myprofile,
    route.myActivityScan,
    route.myvip,
    route.myAssistantKnowledge,
  ],

  // El encargado de una actividad valida el QR de quien la reservó. El backend
  // comprueba, además, que sea el encargado de esa actividad en concreto: esto
  // solo abre la pantalla.
  [UserRole.TRAINER]: [
    ...BASE_ROUTES,
    route.myreferal,
    route.myprofile,
    route.myActivityScan,
    route.myvip,
  ],

  [UserRole.EVENT_STAFF]: [
    ...BASE_ROUTES,
    route.myreferal,
    route.myprofile,
    route.myActivityScan,
    route.myvip,
  ],
};
