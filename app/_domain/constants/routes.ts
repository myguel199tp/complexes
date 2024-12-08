import { RoutePages } from "../types/route";

const route: RoutePages = {
  complexes: "/complexes",
  advertisements: "/advertisement",
  us: "/us",
  contact: "/contact",
  immovables: "/immovables",
  users: "/users",
  registers: "/registers",
  auth: "/auth",
  profile: "/profile",
  registerProperty: "/register-property",
  myprofile: "/my-profile",
  mychats: "/my-chats",
  mysocial: "/my-social",
  mywallet: "/my-wallet",
  myuser: "/my-new-user",
  myexpiration: "/my-expiration",
  myactivies: "/my-activies",
  myantiquity: "/my-antiquity",
  mynewadd: "/my-new-add",
  mynewimmovable: "/my-new-immovable",
};

const listPagePublic: string[] = [
  route.complexes,
  route.us,
  route.advertisements,
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
  route.myexpiration,
  route.myantiquity,
];

export { listPagePublic, route, listPagePrivate };
