import { Suspense } from "react";
import ComercioLoginPage from "./loginpage";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Cargando...</div>}>
      <ComercioLoginPage />
    </Suspense>
  );
}
