import { RoutePages } from "../types/route";

const route: RoutePages = {
  complexes: "/complexes",
  advertisement: "/advertisements",
  us: "/us",
  immovables: "/immovables",
  users: "/users",
  registers: "/registers",
  auth: "/auth",
  profile: "/profile",
  holiday: "/holiday",
  registerComplex: "/registers/complex",
  termsConditions: "/terms-conditions",
  summaryInmov: "/summary-immovables",
  myprofile: "/my-profile",
  mychats: "/my-chats",
  mysocial: "/my-social",
  mynews: "/my-news",
  myadd: "/my-add",
  mywallet: "/my-wallet",
  myuser: "/my-new-user",
  myexpiration: "/my-expiration",
  myactivity: "/my-activity",
  myholliday: "/my-holliday",
  mynewadd: "/my-new-add",
  mynewimmovable: "/my-new-immovable",
  myforo: "/my-foro",
  mycitofonia: "/my-citofonia",
  myvip: "/my-vip",
};

const listPagePublic: string[] = [
  route.complexes,
  route.us,
  route.advertisement,
  route.immovables,
  route.registers,
  route.holiday,
];

const listPagePrivate: string[] = [
  route.myprofile,
  route.mychats,
  route.mysocial,
  route.mywallet,
  route.myuser,
  route.myforo,
  route.myexpiration,
  route.myholliday,
  route.mycitofonia,
  route.mynews,
  route.myadd,
  route.mynewadd,
  route.mynewimmovable,
  route.myactivity,
  route.myvip,
];

export { listPagePublic, route, listPagePrivate };
