"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataBlogServices } from "../services/blogServices";
import { BlogPostResponse } from "../services/response/blogResponse";
import { fileUrl } from "@/app/helpers/fileUrl";

const blogServices = new DataBlogServices();

function imageSrc(image?: string): string | undefined {
  if (!image) return undefined;
  return fileUrl(image);
}

function formatDate(post: BlogPostResponse): string {
  const date = new Date(post.publishedAt ?? post.createdAt);

  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function NewsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["blog_posts_public"],
    queryFn: () => blogServices.getPosts(),
  });

  const { clubNews, legalNews } = useMemo(() => {
    const posts = data ?? [];

    return {
      clubNews: posts.filter((post) => post.section === "CLUB"),
      legalNews: posts.filter((post) => post.section === "LEGAL"),
    };
  }, [data]);

  return (
    <main className="bg-gray-50 min-h-screen">
      <section className="relative py-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/40 via-blue-500/30 to-indigo-600/40 blur-3xl" />
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Centro de Noticias SmartPH
          </h1>
          <p className="mt-6 text-lg text-gray-700">
            Actualizaciones del club e información clave para la gestión
            residencial.
          </p>
        </div>
      </section>

      {isError && (
        <div className="max-w-7xl mx-auto px-6 pb-10">
          <p className="rounded-xl bg-white p-6 text-center text-gray-500 shadow-md">
            No pudimos cargar las noticias en este momento. Intenta de nuevo más
            tarde.
          </p>
        </div>
      )}

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Actualizaciones del Club
            </h2>
            <p className="text-sm text-gray-500">
              Evolución de la plataforma y del ecosistema
            </p>
          </div>
          {clubNews.length > 0 && (
            <span className="text-sm font-semibold text-cyan-600">
              Desliza →
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex gap-6 overflow-hidden pb-4 pr-4">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="min-w-[320px] h-64 bg-white rounded-2xl shadow-xl animate-pulse"
              />
            ))}
          </div>
        ) : clubNews.length === 0 ? (
          <p className="text-gray-500">
            Aún no hay actualizaciones publicadas.
          </p>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-4 pr-4">
            {clubNews.map((item) => (
              <div
                key={item.id}
                className="min-w-[320px] bg-white rounded-2xl shadow-xl hover:shadow-2xl transition"
              >
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageSrc(item.image)}
                    alt={item.title}
                    className="h-36 w-full object-cover rounded-t-2xl"
                  />
                ) : (
                  <div className="h-36 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-t-2xl" />
                )}

                <div className="p-6">
                  {item.tag && (
                    <span className="text-xs uppercase font-semibold text-cyan-600">
                      {item.tag}
                    </span>
                  )}
                  <h3 className="mt-2 font-bold text-gray-800">{item.title}</h3>
                  <p className="mt-3 text-sm text-gray-600">
                    {item.description}
                  </p>
                  <p className="mt-4 text-xs text-gray-400">
                    {formatDate(item)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-10">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Información Normativa
          </h2>
          <p className="mt-2 text-gray-500 text-sm">
            Referencias legales y cambios regulatorios
          </p>
        </div>

        <div className="md:col-span-2 max-h-[420px] overflow-y-auto relative pl-6">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-indigo-200" />

          {isLoading ? (
            [0, 1, 2].map((index) => (
              <div
                key={index}
                className="h-28 bg-white rounded-xl shadow-md ml-4 mb-8 animate-pulse"
              />
            ))
          ) : legalNews.length === 0 ? (
            <p className="ml-4 text-gray-500">
              Aún no hay información normativa publicada.
            </p>
          ) : (
            legalNews.map((item) => (
              <div key={item.id} className="relative mb-8">
                <div className="absolute -left-[6px] top-2 w-3 h-3 bg-indigo-600 rounded-full" />

                <div className="bg-white rounded-xl shadow-md p-6 ml-4">
                  <h4 className="font-semibold text-gray-800">{item.title}</h4>
                  <p className="mt-2 text-sm text-gray-600">
                    {item.description}
                  </p>
                  <p className="mt-3 text-xs text-gray-400">
                    {formatDate(item)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
