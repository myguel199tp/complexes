import type { MetadataRoute } from "next";
import { SITE_URL } from "./_domain/constants/site";

/**
 * Se sirve en /sitemap.xml. Sólo lleva URLs indexables: nada que redirija ni
 * que exija sesión. La portada real es /complexes —"/" sólo redirige—, así que
 * es esa la que se lista, y es también la que declara su canonical.
 *
 * `priority` no es un ranking, es una pista de importancia relativa dentro del
 * propio sitio: primero lo que vende (portada, planes, demostración), después
 * las landings de solución y al final lo legal.
 */
const PATHS: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/complexes", priority: 1, changeFrequency: "weekly" },
  { path: "/soluciones/planes", priority: 0.9, changeFrequency: "monthly" },
  { path: "/soluciones/demost", priority: 0.9, changeFrequency: "monthly" },

  // Landings por audiencia: quien busca no busca "software", busca su rol.
  { path: "/soluciones/administradores", priority: 0.8, changeFrequency: "monthly" },
  { path: "/soluciones/residentes", priority: 0.8, changeFrequency: "monthly" },
  { path: "/soluciones/conjuntos", priority: 0.8, changeFrequency: "monthly" },
  { path: "/soluciones/constructoras", priority: 0.8, changeFrequency: "monthly" },
  { path: "/soluciones/comercios", priority: 0.8, changeFrequency: "monthly" },

  // Landings por módulo: son las que capturan la búsqueda concreta.
  { path: "/soluciones/citofonia", priority: 0.8, changeFrequency: "monthly" },
  { path: "/soluciones/acceso", priority: 0.8, changeFrequency: "monthly" },
  { path: "/soluciones/cartera", priority: 0.8, changeFrequency: "monthly" },
  { path: "/soluciones/asamblea", priority: 0.8, changeFrequency: "monthly" },
  { path: "/soluciones/comunicaciones", priority: 0.8, changeFrequency: "monthly" },
  { path: "/soluciones/documental", priority: 0.8, changeFrequency: "monthly" },
  { path: "/soluciones/holiday", priority: 0.7, changeFrequency: "monthly" },
  { path: "/soluciones/alquileres", priority: 0.7, changeFrequency: "monthly" },
  { path: "/soluciones/market", priority: 0.7, changeFrequency: "monthly" },
  { path: "/soluciones/convenios", priority: 0.7, changeFrequency: "monthly" },
  { path: "/soluciones/beneficios", priority: 0.7, changeFrequency: "monthly" },
  { path: "/soluciones/assistente", priority: 0.7, changeFrequency: "monthly" },
  { path: "/soluciones/ecosistemas", priority: 0.6, changeFrequency: "yearly" },
  { path: "/soluciones/about", priority: 0.6, changeFrequency: "yearly" },
  { path: "/soluciones/contact", priority: 0.6, changeFrequency: "yearly" },
  { path: "/soluciones/jobuse", priority: 0.5, changeFrequency: "monthly" },
  { path: "/soluciones/blogs", priority: 0.7, changeFrequency: "weekly" },

  // Marketplace e inmuebles: catálogo público.
  { path: "/immovables", priority: 0.8, changeFrequency: "daily" },
  { path: "/advertisements", priority: 0.7, changeFrequency: "weekly" },

  // Club y compañía.
  { path: "/us", priority: 0.7, changeFrequency: "monthly" },
  { path: "/us/platform", priority: 0.6, changeFrequency: "monthly" },
  { path: "/us/alianz", priority: 0.6, changeFrequency: "monthly" },
  { path: "/us/benefits", priority: 0.6, changeFrequency: "monthly" },
  { path: "/us/colective", priority: 0.6, changeFrequency: "monthly" },
  { path: "/us/marketclub", priority: 0.6, changeFrequency: "monthly" },
  { path: "/us/decisions", priority: 0.5, changeFrequency: "monthly" },
  { path: "/us/privat", priority: 0.5, changeFrequency: "monthly" },
  { path: "/us/support", priority: 0.6, changeFrequency: "monthly" },

  { path: "/terms-conditions", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PATHS.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
