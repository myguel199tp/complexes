"use client";

import { route } from "@/app/_domain/constants/routes";
import { Button, Text, Title } from "complexes-next-components";
import {
  Bell,
  Building2,
  Megaphone,
  MessageCircle,
  Radio,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Canales de comunicación del conjunto.
 *
 * La página anterior solo mencionaba la cartelera y "mensajes directos": no
 * decía que existen grupos de chat, que se pueden armar por torre en un paso,
 * ni que hay difusión masiva y avisos por push y WhatsApp.
 */
const CANALES = [
  {
    icono: Megaphone,
    color: "text-cyan-400",
    borde: "from-cyan-500 to-blue-500",
    titulo: "Cartelera digital",
    desc: "Publica comunicados del conjunto: asambleas, mantenimientos, cortes de agua o novedades. Quedan publicados y consultables, no se pierden en una conversación.",
  },
  {
    icono: MessageCircle,
    color: "text-blue-400",
    borde: "from-blue-500 to-indigo-500",
    titulo: "Chat directo",
    desc: "Conversación uno a uno entre el residente y la administración, en tiempo real. Para el trámite puntual que no le importa a toda la comunidad.",
  },
  {
    icono: Users,
    color: "text-purple-400",
    borde: "from-purple-500 to-fuchsia-500",
    titulo: "Grupos de chat",
    desc: "Grupos por torre, por comité o por el tema que haga falta. Los crea la administración y los residentes conversan entre ellos sin salir de la plataforma.",
  },
  {
    icono: Radio,
    color: "text-emerald-400",
    borde: "from-emerald-500 to-teal-500",
    titulo: "Difusión masiva",
    desc: "Un mensaje que le llega a todo el conjunto de una vez, con el alcance que permita el plan contratado. Para lo urgente que no da espera.",
  },
];

const GRUPOS = [
  {
    icono: Building2,
    titulo: "Armado por torre en un paso",
    desc: "Eliges la torre y entran todos sus residentes. No hay que agregar uno por uno ni mantener listas a mano.",
  },
  {
    icono: Users,
    titulo: "Se resincroniza cuando la torre cambia",
    desc: "Si alguien se muda o llega un residente nuevo, el grupo se actualiza sin volver a crearlo.",
  },
  {
    icono: MessageCircle,
    titulo: "Miembros sueltos, si hace falta",
    desc: "Además de la torre puedes sumar personas concretas: el consejo, los del comité de convivencia, los del parqueadero.",
  },
  {
    icono: Bell,
    titulo: "Aviso a cada miembro",
    desc: "Cada mensaje del grupo notifica a quienes lo integran, así que nadie tiene que estar entrando a revisar.",
  },
];

export default function ComunicacionesPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#050816] text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,255,255,0.15),transparent_60%)]" />

      {/* ================= HERO ================= */}
      <section className="relative py-24 text-center px-6">
        <Title as="h1" size="md" font="bold" className="md:text-6xl bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Centro de Comunicaciones
        </Title>

        <Text className="mt-6 max-w-2xl mx-auto text-gray-300 text-lg">
          Cuatro canales para que el mensaje llegue por donde corresponde: la
          cartelera para lo que queda, el chat para lo que se conversa, los
          grupos para lo que es de unos pocos y la difusión para lo urgente.
        </Text>

        <div className="mt-8 flex justify-center">
          <Button
            colVariant="success"
            onClick={() => router.push(route.demost)}
            rounded="lg"
          >
            Solicitar demostración
          </Button>
        </div>
      </section>

      {/* ================= CANALES ================= */}
      <section className="relative max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-10">
          {CANALES.map((canal) => {
            const Icono = canal.icono;

            return (
              <div key={canal.titulo} className="relative group">
                <div
                  className={`absolute -inset-[1px] bg-gradient-to-r ${canal.borde} rounded-2xl blur opacity-40 group-hover:opacity-80 transition`}
                />

                <div className="relative h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
                  <Icono className={`w-10 h-10 ${canal.color} mb-6`} />

                  <Title as="h2" size="xs" font="semi" className="mb-4">
                    {canal.titulo}
                  </Title>

                  <Text size="sm" className="text-gray-300 leading-relaxed">{canal.desc}</Text>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= GRUPOS ================= */}
      <section className="relative border-t border-white/10 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="max-w-3xl">
            <span className="inline-block mb-4 px-4 py-1 text-sm font-semibold text-purple-300 bg-purple-400/10 rounded-full">
              Grupos de chat
            </span>

            <Title as="h2" size="sm" font="bold" className="md:text-4xl">
              El grupo de la torre, dentro del conjunto
            </Title>

            <Text className="mt-5 text-gray-300 text-lg leading-relaxed">
              La conversación del conjunto suele terminar en un grupo de
              WhatsApp que nadie administra, donde entra gente que ya no vive
              ahí y del que no queda registro. Aquí el grupo vive donde vive el
              conjunto: lo crea la administración, la membresía sale de las
              unidades reales y se puede actualizar cuando cambian.
            </Text>
          </div>

          <div className="mt-14 grid sm:grid-cols-2 gap-6">
            {GRUPOS.map((item) => {
              const Icono = item.icono;

              return (
                <div
                  key={item.titulo}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-400/40 transition"
                >
                  <Icono className="w-7 h-7 text-purple-400 mb-4" />

                  <Text as="h3" font="semi" className="text-lg">{item.titulo}</Text>

                  <Text size="sm" className="mt-2 text-gray-400 leading-relaxed">
                    {item.desc}
                  </Text>
                </div>
              );
            })}
          </div>

          <Text size="sm" className="mt-10 text-gray-500 max-w-3xl">
            Los grupos los crea el personal del conjunto, no cualquier
            residente: así no se multiplican grupos paralelos ni queda nadie
            fuera del que le corresponde.
          </Text>
        </div>
      </section>

      {/* ================= ENTREGA ================= */}
      <section className="relative border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <Title as="h2" size="sm" font="bold" className="md:text-4xl text-center">
            Que el mensaje llegue de verdad
          </Title>

          <Text size="sm" className="mt-4 text-center text-gray-400 max-w-2xl mx-auto">
            Publicar no sirve de nada si nadie entra a mirar.
          </Text>

          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {[
              [
                "Notificación al celular",
                "Cada comunicado, mensaje o aviso de grupo llega como notificación push, y al tocarla se abre justo donde corresponde.",
              ],
              [
                "WhatsApp cuando hace falta",
                "Para el residente que no tiene la app abierta, el mensaje puede salir también por WhatsApp.",
              ],
              [
                "Nada se pierde",
                "Los mensajes quedan guardados y se entregan cuando el destinatario vuelve a conectarse.",
              ],
            ].map(([titulo, desc]) => (
              <div
                key={titulo}
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <Text as="h3" font="semi" className="text-lg">{titulo}</Text>
                <Text size="sm" className="mt-2 text-gray-400 leading-relaxed">{desc}</Text>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button
              colVariant="success"
              onClick={() => router.push(route.demost)}
              rounded="lg"
            >
              Solicitar demostración
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
