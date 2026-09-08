"use client";

/**
 * Último recurso: sólo se muestra cuando falla el propio layout raíz, así que
 * reemplaza al documento entero y tiene que traer su `<html>` y su `<body>`.
 *
 * Va con estilos en línea a propósito. Si el layout raíz no se montó, tampoco
 * se cargó `globals.css`, de modo que las clases de Tailwind y los componentes
 * del design system no existen aquí: cualquier import de ellos daría una
 * pantalla en blanco, que es justo lo que este archivo evita.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "0 1.5rem",
          textAlign: "center",
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          background: "#0f172a",
          color: "#f8fafc",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
          Algo salió mal
        </h1>

        <p style={{ maxWidth: "28rem", margin: 0, color: "#cbd5e1" }}>
          No pudimos cargar la aplicación. Vuelve a intentarlo; si el problema
          continúa, escríbenos y lo revisamos.
        </p>

        <button
          type="button"
          onClick={reset}
          style={{
            cursor: "pointer",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.625rem 1.25rem",
            fontSize: "0.9375rem",
            fontWeight: 600,
            background: "#0e7490",
            color: "#ffffff",
          }}
        >
          Reintentar
        </button>
      </body>
    </html>
  );
}
