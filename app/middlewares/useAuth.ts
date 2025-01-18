"use client";
import { useEffect, useState } from "react";
import { parseCookies } from "nookies";

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const isTokenValid = payload && Date.now() < payload.exp * 1000;
        setIsLoggedIn(isTokenValid);
      } catch {
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return isLoggedIn;
}
