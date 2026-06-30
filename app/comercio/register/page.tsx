import { Suspense } from "react";
import ComercioRegisterForm from "./form";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Cargando...</div>}>
      <ComercioRegisterForm />
    </Suspense>
  );
}
