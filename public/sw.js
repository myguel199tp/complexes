/* eslint-disable no-restricted-globals */

/**
 * Service worker de las notificaciones del navegador (Web Push).
 *
 * Solo hace dos cosas: mostrar el aviso que manda el backend y, al tocarlo,
 * llevar a la página que trae (`url`). No cachea nada: la web sigue sin modo
 * sin conexión.
 *
 * El backend arma el mensaje en `src/web-push/web-push.service.ts`:
 *   { title, body, url, tag?, data }
 */

const ICON = "/icon.png";

self.addEventListener("install", () => {
  // La versión nueva entra sin esperar a que se cierren todas las pestañas.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Toma control de las pestañas ya abiertas para poder navegarlas al tocar
  // un aviso.
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let message = {};

  try {
    message = event.data ? event.data.json() : {};
  } catch {
    message = { body: event.data ? event.data.text() : "" };
  }

  const title = message.title || "globaliaph";
  const options = {
    body: message.body || "",
    icon: ICON,
    badge: ICON,
    data: { url: safeUrl(message.url) },
  };

  // El aviso nuevo del mismo pedido o cotización reemplaza al anterior, pero
  // vuelve a sonar.
  if (message.tag) {
    options.tag = message.tag;
    options.renotify = true;
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = safeUrl(event.notification.data && event.notification.data.url);

  event.waitUntil(openPage(url));
});

/**
 * Solo rutas de este mismo sitio: un mensaje no puede mandar a otro dominio.
 */
function safeUrl(url) {
  if (typeof url !== "string" || !url.startsWith("/") || url.startsWith("//")) {
    return "/";
  }
  return url;
}

/** Panel al que pertenece una ruta: cada uno tiene su propia sesión. */
function panelOf(pathname) {
  if (pathname.startsWith("/comercio")) return "comercio";
  if (pathname.startsWith("/delivery")) return "delivery";
  return "user";
}

/**
 * Reutiliza una pestaña abierta del mismo panel —la del comercio para un aviso
 * del comercio— y la lleva a la página; si no hay, abre una nueva.
 */
async function openPage(url) {
  const target = new URL(url, self.location.origin);
  const panel = panelOf(target.pathname);

  const windows = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  const samePanel = windows.filter(
    (client) => panelOf(new URL(client.url).pathname) === panel,
  );
  const client = samePanel.find((c) => c.focused) || samePanel[0];

  if (client) {
    try {
      await client.focus();
      if (new URL(client.url).href !== target.href) {
        await client.navigate(target.href);
      }
      return;
    } catch {
      // Una pestaña que este service worker no controla no se puede navegar:
      // se abre otra.
    }
  }

  await self.clients.openWindow(target.href);
}
