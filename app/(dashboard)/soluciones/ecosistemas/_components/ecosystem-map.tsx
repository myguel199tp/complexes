"use client";

/**
 * Mapa del ecosistema: la plataforma en el centro y los cinco actores en
 * órbita. Es la pieza que explica la tesis sin texto —se ve que todos cuelgan
 * del mismo punto— y al elegir un actor se abre lo que pone y lo que recibe.
 *
 * Las posiciones se calculan con trigonometría en vez de escribirlas a mano:
 * si mañana entra o sale un actor de `ACTORS`, la órbita se reparte sola.
 *
 * En pantallas chicas la órbita no cabe legible, así que ahí los actores se
 * muestran como chips que se acomodan en filas; el panel de detalle es el mismo en los
 * dos casos.
 *
 * El actor elegido no es estado del mapa sino de la página
 * (`EcosystemPerspectiveProvider`): el resto de secciones se reordenan y
 * atenúan según él. Por eso se elige con clic y no al pasar el mouse —un hover
 * reacomodaría la página entera cada vez que el cursor cruza la órbita—, y el
 * núcleo sirve para volver a ver todo el ecosistema.
 */

import { FaRobot } from "react-icons/fa";
import { Text, Title } from "complexes-next-components";
import { ACTORS } from "./ecosystem-data";
import { useEcosystemPerspective } from "./ecosystem-perspective";

/** Radio de la órbita, en porcentaje del contenedor cuadrado. */
const RADIO = 38;

interface Posicion {
  x: number;
  y: number;
}

/** Reparte los nodos en el círculo empezando arriba (-90°). */
function posicionar(indice: number, total: number): Posicion {
  const angulo = ((360 / total) * indice - 90) * (Math.PI / 180);
  return {
    x: 50 + RADIO * Math.cos(angulo),
    y: 50 + RADIO * Math.sin(angulo),
  };
}

export default function EcosystemMap() {
  const { activo, actor, setActivo } = useEcosystemPerspective();

  return (
    <div className="grid grid-cols-1 items-center gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-16">
      {/* ÓRBITA (solo donde hay espacio para que se lea) */}
      <div className="relative mx-auto hidden aspect-square w-full max-w-[520px] lg:block">
        {/* Anillos de fondo: dan profundidad y marcan la órbita. */}
        <div className="absolute inset-[8%] rounded-full border border-white/10" />
        <div
          className="absolute inset-[8%] animate-spin rounded-full border border-dashed border-white/15"
          style={{ animationDuration: "90s" }}
        />
        <div className="absolute inset-[26%] rounded-full border border-white/5" />

        {/* Radios: se encienden en el color del actor seleccionado. */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          {ACTORS.map((item, indice) => {
            const { x, y } = posicionar(indice, ACTORS.length);
            const seleccionado = item.id === activo;
            return (
              <line
                key={item.id}
                x1="50"
                y1="50"
                x2={x}
                y2={y}
                strokeWidth={seleccionado ? 0.6 : 0.3}
                className={`transition-all duration-500 ${
                  seleccionado ? item.accent.line : "stroke-white/15"
                }`}
              />
            );
          })}
        </svg>

        {/* NÚCLEO: vuelve a la vista de todo el ecosistema. */}
        <button
          type="button"
          onClick={() => setActivo(null)}
          aria-pressed={activo === null}
          aria-label="Ver todo el ecosistema"
          className={`absolute left-1/2 top-1/2 flex h-[26%] w-[26%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border bg-slate-900/90 text-center shadow-[0_0_60px_-10px_rgba(34,211,238,0.5)] backdrop-blur-xl transition-colors ${
            activo === null
              ? "border-cyan-300/60"
              : "border-white/20 hover:border-cyan-300/50"
          }`}
        >
          <FaRobot className="mb-1 text-xl text-cyan-300" />
          <span className="px-2 text-[11px] font-semibold leading-tight text-white">
            globaliaph
          </span>
          <span className="px-2 text-[10px] leading-tight text-slate-400">
            {activo === null ? "+40 módulos" : "Ver todo"}
          </span>
        </button>

        {/* NODOS */}
        {ACTORS.map((item, indice) => {
          const { x, y } = posicionar(indice, ACTORS.length);
          const seleccionado = item.id === activo;
          const Icono = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivo(seleccionado ? null : item.id)}
              aria-pressed={seleccionado}
              style={{ left: `${x}%`, top: `${y}%` }}
              className={`absolute flex h-[19%] w-[19%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-full border bg-slate-900/80 text-center backdrop-blur-xl transition-all duration-300 ${
                seleccionado
                  ? `${item.accent.ring} ${item.accent.glow} scale-110`
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              <Icono
                className={`text-lg transition-colors ${
                  seleccionado ? item.accent.text : "text-slate-400"
                }`}
              />
              <span className="px-1 text-[10px] font-medium leading-tight text-slate-200">
                {item.nombre}
              </span>
            </button>
          );
        })}
      </div>

      {/* SELECTOR EN MÓVIL: chips que se acomodan en filas, todos a la vista
          (el carrusel dejaba actores cortados en el borde de la tarjeta). */}
      <div className="min-w-0 lg:hidden">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActivo(null)}
            aria-pressed={activo === null}
            className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-2 text-xs font-medium transition-colors sm:px-4 ${
              activo === null
                ? "border-cyan-400/60 bg-white/10 text-cyan-300"
                : "border-white/10 text-slate-300"
            }`}
          >
            <FaRobot className="text-sm" />
            Todo el ecosistema
          </button>
          {ACTORS.map((item) => {
            const seleccionado = item.id === activo;
            const Icono = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivo(seleccionado ? null : item.id)}
                aria-pressed={seleccionado}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-2 text-xs font-medium transition-colors sm:px-4 ${
                  seleccionado
                    ? `${item.accent.ring} ${item.accent.text} bg-white/10`
                    : "border-white/10 text-slate-300"
                }`}
              >
                <Icono className="text-sm" />
                {item.nombre}
              </button>
            );
          })}
        </div>
      </div>

      {/* DETALLE DEL ACTOR (o el panorama, si todavía no eligió ninguno) */}
      {actor === null ? (
        <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:rounded-3xl sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/60 bg-slate-900/60 text-cyan-300">
              <FaRobot className="text-lg" />
            </span>
            <div className="min-w-0">
              <Title as="h3" size="sm" font="semi" className="text-white">
                Todo el ecosistema
              </Title>
              <Text size="sm" className="text-slate-400">
                Cinco actores, una misma plataforma
              </Text>
            </div>
          </div>

          <Text className="leading-relaxed text-slate-300">
            Elige desde dónde quieres mirar: la página se reordena para
            mostrarte primero los recorridos y beneficios que te tocan.
          </Text>

          {/* En móvil estos chips repetirían el selector de arriba. */}
          <div className="mt-6 hidden flex-wrap gap-2 border-t border-white/10 pt-5 lg:flex">
            {ACTORS.map((item) => {
              const Icono = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActivo(item.id)}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition-colors hover:border-white/30"
                >
                  <Icono className={item.accent.text} />
                  {item.nombre}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:rounded-3xl sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border bg-slate-900/60 ${actor.accent.ring} ${actor.accent.text}`}
            >
              <actor.icon className="text-lg" />
            </span>
            <div className="min-w-0">
              <Title as="h3" size="sm" font="semi" className="text-white">
                {actor.nombre}
              </Title>
              <Text size="sm" className="text-slate-400">
                {actor.rol}
              </Text>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <Text
                size="sm"
                className={`mb-1 font-semibold uppercase tracking-wider ${actor.accent.text}`}
              >
                Qué pone
              </Text>
              <Text className="text-slate-300 leading-relaxed">
                {actor.aporta}
              </Text>
            </div>

            <div>
              <Text
                size="sm"
                className={`mb-1 font-semibold uppercase tracking-wider ${actor.accent.text}`}
              >
                Qué se lleva
              </Text>
              <Text className="text-slate-300 leading-relaxed">
                {actor.recibe}
              </Text>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-white/10 pt-5">
              {actor.modulos.map((modulo) => (
                <span
                  key={modulo}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                >
                  {modulo}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
