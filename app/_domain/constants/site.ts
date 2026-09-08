/**
 * Datos canónicos del sitio público. Viven en un solo sitio porque los usan
 * el layout raíz (metadataBase, Open Graph, JSON-LD), el sitemap y el robots:
 * si el dominio cambia, cambia aquí y no en quince archivos.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://www.globaliaph.com";

export const SITE_NAME = "globaliaph";

export const SITE_TAGLINE =
  "Software de gestión para conjuntos residenciales";

/**
 * Imagen que se comparte en WhatsApp, LinkedIn, Facebook y X. Es la única del
 * repositorio con proporción y peso razonables para una tarjeta social.
 */
export const OG_IMAGE = {
  url: "/nameImage.png",
  width: 1536,
  height: 1024,
  alt: "globaliaph, plataforma de gestión para conjuntos residenciales",
} as const;

/** Correo y redes que Google usa para consolidar la entidad de marca. */
export const SITE_CONTACT_EMAIL = "info@globaliaph.com";

export const SITE_SAME_AS: string[] = [
  "https://www.facebook.com/globaliaph",
  "https://www.instagram.com/globaliaph",
  "https://www.linkedin.com/company/globaliaph",
];
