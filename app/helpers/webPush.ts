/**
 * Notificaciones del navegador (Web Push) para los tres paneles.
 *
 * Cada panel tiene su propia sesión y su propio proxy, así que la suscripción
 * se guarda contra el dueño que corresponde: el usuario del conjunto, el
 * comercio o el repartidor. Un mismo navegador puede estar suscrito a la vez
 * para varios (el dueño de un negocio que también vive en un conjunto).
 *
 * Todas las llamadas van con `fetch` directo al proxy y no con
 * `comercioFetch`/`deliveryFetch`: esos, ante un 401, cierran la sesión, y
 * cerrar la sesión borra la suscripción —un 401 ahí daría la vuelta en
 * círculo—.
 */

export type WebPushKind = "user" | "comercio" | "delivery";

export type WebPushResult =
  | "granted"
  | "denied"
  | "default"
  | "unsupported"
  | "unavailable";

const API: Record<WebPushKind, { base: string; subscription: string }> = {
  user: { base: "/api/proxy/api", subscription: "/web-push/subscription" },
  comercio: { base: "/api/comercio/proxy/api", subscription: "/comercio/web-push" },
  delivery: { base: "/api/delivery/proxy/api", subscription: "/delivery/web-push" },
};

const SW_URL = "/sw.js";

export function isWebPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    window.isSecureContext &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function webPushPermission(): NotificationPermission | "unsupported" {
  return isWebPushSupported() ? Notification.permission : "unsupported";
}

let publicKeyPromise: Promise<string | null> | null = null;

/** La clave VAPID del servidor; `null` si no tiene Web Push configurado. */
export function fetchWebPushKey(kind: WebPushKind): Promise<string | null> {
  if (!publicKeyPromise) {
    publicKeyPromise = fetch(`${API[kind].base}/web-push/public-key`, {
      credentials: "same-origin",
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((body) =>
        typeof body?.publicKey === "string" && body.publicKey
          ? body.publicKey
          : null,
      )
      .catch(() => {
        // Sin caché del fallo: el próximo intento vuelve a preguntar.
        publicKeyPromise = null;
        return null;
      });
  }
  return publicKeyPromise;
}

/**
 * Pide permiso y suscribe este navegador. Tiene que llamarse desde un clic:
 * Safari y Firefox ignoran el pedido de permiso si no viene de un gesto.
 */
export async function enableWebPush(kind: WebPushKind): Promise<WebPushResult> {
  if (!isWebPushSupported()) return "unsupported";

  const key = await fetchWebPushKey(kind);
  if (!key) return "unavailable";

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission;

  const saved = await subscribeAndSave(kind, key);
  return saved ? "granted" : "unavailable";
}

/**
 * Al abrir el panel con el permiso ya dado: vuelve a registrar la suscripción
 * para quien tiene la sesión ahora. Si en este navegador entró otra persona,
 * los avisos pasan a ella; si el navegador renovó la suscripción, el servidor
 * recibe la nueva.
 */
export async function syncWebPush(kind: WebPushKind): Promise<void> {
  if (webPushPermission() !== "granted") return;

  const key = await fetchWebPushKey(kind);
  if (!key) return;

  await subscribeAndSave(kind, key).catch(() => false);
}

/**
 * Al cerrar sesión: este navegador deja de recibir los avisos de esa cuenta.
 * No anula la suscripción del navegador, porque puede seguir sirviendo a otro
 * panel. Con tope de tiempo: cerrar sesión no puede quedarse esperando.
 */
export async function disableWebPush(kind: WebPushKind): Promise<void> {
  if (!isWebPushSupported()) return;

  const work = (async () => {
    const registration = await navigator.serviceWorker.getRegistration(SW_URL);
    const subscription = await registration?.pushManager.getSubscription();
    if (!subscription) return;

    await fetch(`${API[kind].base}${API[kind].subscription}`, {
      method: "DELETE",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
      keepalive: true,
    });
  })().catch(() => undefined);

  await Promise.race([work, new Promise((resolve) => setTimeout(resolve, 1500))]);
}

async function subscribeAndSave(kind: WebPushKind, key: string): Promise<boolean> {
  await navigator.serviceWorker.register(SW_URL, { scope: "/" });
  const registration = await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();

  // Si el servidor cambió de clave, la suscripción vieja ya no sirve.
  if (subscription && !sameKey(subscription, key)) {
    await subscription.unsubscribe().catch(() => undefined);
    subscription = null;
  }

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToBytes(key),
    });
  }

  const json = subscription.toJSON();
  const res = await fetch(`${API[kind].base}${API[kind].subscription}`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: json.endpoint,
      keys: json.keys,
      userAgent: navigator.userAgent.slice(0, 255),
    }),
  });

  return res.ok;
}

function sameKey(subscription: PushSubscription, key: string): boolean {
  const current = subscription.options?.applicationServerKey;
  if (!current) return true;

  const a = new Uint8Array(current);
  const b = base64UrlToBytes(key);
  return a.length === b.length && a.every((byte, i) => byte === b[i]);
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  const raw = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}
