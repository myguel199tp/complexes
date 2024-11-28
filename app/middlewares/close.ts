import { destroyCookie } from "nookies";

export const logout = () => {
  destroyCookie(null, "accessToken", { path: "/" });
};
