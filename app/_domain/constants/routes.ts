import { RoutePages } from "../types/route";

const route: RoutePages = {
  complexes: "/complexes",
  advertisement: "/advertisements",
  us: "/us",
  contact: "/contact",
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
  mywallet: "/my-wallet",
  myuser: "/my-new-user",
  myexpiration: "/my-expiration",
  myactivies: "/my-activies",
  myantiquity: "/my-antiquity",
  mynewadd: "/my-new-add",
  mynewimmovable: "/my-new-immovable",
  myforo: "/my-foro",
  mycitofonia: "/my-citofonia",
};

const listPagePublic: string[] = [
  route.complexes,
  route.us,
  route.advertisement,
  route.contact,
  route.immovables,
  route.registers,
];

const listPagePrivate: string[] = [
  route.myprofile,
  route.mychats,
  route.mysocial,
  route.mywallet,
  route.myuser,
  route.myforo,
  route.myexpiration,
  route.myantiquity,
];

export { listPagePublic, route, listPagePrivate };
