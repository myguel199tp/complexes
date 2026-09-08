import type { Metadata } from "next";
import { OG_IMAGE, SITE_NAME } from "./site";

type PageSeo = {
  /** Título sin la marca: el layout raíz la añade con `title.template`. */
  title: string;
  /** 140-160 caracteres, con la palabra clave de la pantalla al principio. */
  description: string;
  /** Ruta absoluta del sitio, sin dominio ni barra final: "/soluciones/planes". */
  path: string;
  /** Texto de la tarjeta social cuando conviene que sea más corto que el meta. */
  socialDescription?: string;
  /** Pantallas con sesión o duplicadas, que no deben entrar al índice. */
  index?: boolean;
  /**
   * Marcar en un segmento que tiene rutas hijas (p. ej. /us frente a
   * /us/support): un `title` de texto plano corta la plantilla del layout raíz
   * y las hijas se quedarían sin la marca en su título.
   */
  hasChildRoutes?: boolean;
};

/**
 * Metadata de una pantalla pública.
 *
 * Existe porque Next **reemplaza** el objeto `openGraph` completo cuando una
 * pantalla declara el suyo: escribir sólo `title` y `url` en un layout hijo
 * borra la imagen, el `siteName` y el `locale` que venían del layout raíz, y la
 * tarjeta de WhatsApp o LinkedIn sale sin foto. Aquí se reconstruye entero cada
 * vez, con el canonical y la tarjeta de Twitter en el mismo sitio.
 */
export function pageMetadata({
  title,
  description,
  path,
  socialDescription,
  index = true,
  hasChildRoutes = false,
}: PageSeo): Metadata {
  const social = socialDescription ?? description;
  const socialTitle = `${title} | ${SITE_NAME}`;

  return {
    title: hasChildRoutes
      ? { absolute: socialTitle, template: `%s | ${SITE_NAME}` }
      : title,
    description,
    alternates: { canonical: path },
    ...(index ? {} : { robots: { index: false, follow: false } }),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "es_CO",
      url: path,
      title: socialTitle,
      description: social,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: social,
      images: [OG_IMAGE.url],
    },
  };
}
