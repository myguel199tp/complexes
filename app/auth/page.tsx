import { Suspense } from "react";
import LoginPage from "./loginpage";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Cargando...</div>}>
      <LoginPage />
    </Suspense>
  );
}
