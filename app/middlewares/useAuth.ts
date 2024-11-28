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
        const payload = JSON.parse(atob(token.split(".")[1])); // Decodifica el token
        const isTokenValid = payload && Date.now() < payload.exp * 1000; // Verifica expiración
        setIsLoggedIn(isTokenValid);
      } catch {
        setIsLoggedIn(false); // Si falla la decodificación, el usuario no está logeado
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return isLoggedIn;
}
