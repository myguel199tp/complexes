import Link from "next/link";
import { route } from "./_domain/constants/routes";

/**
 * 404 de todo el sitio.
 *
 * No lleva botón de reintentar como las pantallas de error: aquí no falló
 * nada, la URL sencillamente no existe, y lo único útil es una salida hacia la
 * portada.
 *
 * Va con etiquetas planas y no con los componentes de `complexes-next-components`
 * porque Next monta esta pantalla como componente de servidor y ese paquete usa
 * `createContext`: importarlo aquí rompe el build entero.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold">Esta página no existe</h1>

      <p className="max-w-md text-sm">
        El enlace que abriste puede estar desactualizado o la dirección tiene un
        error de escritura.
      </p>

      <Link
        href={route.complexes}
        className="rounded-lg bg-cyan-700 px-5 py-2 text-sm font-semibold text-white hover:bg-cyan-800"
      >
        Ir al inicio
      </Link>
    </div>
  );
}
