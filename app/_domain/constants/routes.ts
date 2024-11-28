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
};

const listPagePublic: string[] = [
  route.complexes,
  route.us,
  route.advertisements,
  route.contact,
  route.immovables,
  route.registers,
];

const listPagePrivate: string[] = [route.profile, route.registerProperty];

export { listPagePublic, route, listPagePrivate };
