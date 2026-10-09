"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import LaryAvatar from "@/app/(panel)/my-new-user/_components/lary-avatar";
import {
  speak,
  stopSpeaking,
} from "@/app/(panel)/my-new-user/_components/assistant-speech";
import type {
  AssistantGuide,
  AssistantGuidePlace,
  AssistantGuideState,
} from "@/app/(panel)/my-new-user/services/assistantGuideService";
import LarySpotlight, {
  findGuideTarget,
} from "@/app/(panel)/_components/lary-spotlight";

/**
 * Pide abrir la guía desde cualquier parte: el botón 📖 del chat de Lary, el
 * del dock, la respuesta a "ver guía" (meta `OPEN_GUIDE`) o el botón flotante
 * de los paneles del comercio y del domiciliario. Nunca hay dos guías montadas
 * a la vez (cada panel tiene su layout), así que basta un solo evento.
 */
export const OPEN_GUIDE_EVENT = "smartph:open-guide";

export function openLaryGuide() {
  window.dispatchEvent(new Event(OPEN_GUIDE_EVENT));
}

/** Cuánto se queda señalado el ítem del menú antes de entrar a la pantalla. */
const MENU_HIGHLIGHT_MS = 1700;
/** Margen para que la pantalla nueva reemplace a la anterior antes de buscar. */
const PAGE_SETTLE_MS = 600;

export const matchesRoute = (pathname: string, route: string) =>
  pathname === route || pathname.startsWith(route + "/");

type Mode = "closed" | "card" | "coach";

export interface LaryGuideViewProps {
  /**
   * Trae la guía y si ya se vio. Debe ser estable (useCallback): cambiarla
   * vuelve a consultar, y es como se recarga al cambiar de conjunto o sesión.
   * null: todavía no se puede pedir (sin sesión).
   */
  load: (() => Promise<AssistantGuideState>) | null;
  markSeen: (guideId: string) => void;
  /** Si "Llévame ahí" puede entrar a ese lugar con este rol y este plan. */
  canGo: (place: AssistantGuidePlace) => boolean;
  /** Prefijo del menú cuando se reconoce el ítem real ("Menú lateral"). */
  menuName?: string;
}

/**
 * 📖 Guía de bienvenida de Lary.
 *
 * Dos modos:
 * - **Tarjeta**: cada paso cuenta qué se puede hacer y dónde está.
 * - **Acompañante**: con "Llévame ahí" Lary señala el ítem del menú, entra a
 *   la pantalla, resalta el botón que importa y se queda en una esquina con
 *   los pasos de qué tocar. No tapa la página: la idea es que lo haga ahí
 *   mismo. "Siguiente" lo lleva al módulo que sigue.
 *
 * Sale sola la primera vez y luego a pedido. El contenido y el "ya la vio" los
 * decide el backend, así que la misma persona no la recibe otra vez en la app.
 *
 * Es solo la vista: de dónde sale la guía y qué rutas se le pueden ofrecer lo
 * decide cada panel (`(panel)/_components/lary-guide`, el del comercio y el del
 * domiciliario), porque cada uno tiene su sesión y sus reglas de acceso.
 */
export default function LaryGuideView({
  load: fetchGuide,
  markSeen,
  canGo: canEnter,
  menuName = "Menú lateral",
}: LaryGuideViewProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [guide, setGuide] = useState<AssistantGuide | null>(null);
  const [mode, setMode] = useState<Mode>("closed");
  const [step, setStep] = useState(0);
  /** Lary lee en voz alta. Apagado al inicio: el navegador bloquea el audio sin un clic previo. */
  const [voice, setVoice] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  /** Lo que el anillo señala ahora mismo. */
  const [spot, setSpot] = useState<{ selector: string; label: string } | null>(
    null,
  );
  /** Señalando el menú, antes de entrar a la pantalla. */
  const [onMenu, setOnMenu] = useState(false);
  /** El nombre real del ítem del menú: el catálogo lo define cada conjunto. */
  const [menuLabel, setMenuLabel] = useState<string | null>(null);
  /** El botón a resaltar no apareció: el plan o el rol no lo traen. */
  const [missing, setMissing] = useState(false);

  const timers = useRef<number[]>([]);
  const nextRef = useRef<HTMLButtonElement>(null);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const load = useCallback(async () => {
    if (!fetchGuide) return null;
    const state = await fetchGuide();
    setGuide(state.guide);
    return state;
  }, [fetchGuide]);

  // Primera entrada: si no la ha visto, se abre sola tras un momento para que
  // el panel alcance a pintarse detrás y se entienda de qué habla.
  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    load()
      .then((state) => {
        if (cancelled || !state?.guide || state.seen) return;
        timer = window.setTimeout(() => {
          setStep(0);
          setMode("card");
        }, 900);
      })
      .catch(() => {
        // Sin guía el panel funciona igual: no vale la pena avisar.
      });

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [load]);

  const resetCoach = () => {
    clearTimers();
    setSpot(null);
    setOnMenu(false);
    setMenuLabel(null);
    setMissing(false);
  };

  // A pedido: "ver guía", el botón del chat o el del dock.
  useEffect(() => {
    const onOpen = () => {
      resetCoach();
      setStep(0);
      if (guide) {
        setMode("card");
        return;
      }
      load()
        .then((state) => {
          if (state?.guide) setMode("card");
        })
        .catch(() => {});
    };

    window.addEventListener(OPEN_GUIDE_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_GUIDE_EVENT, onOpen);
  }, [guide, load]);

  const close = useCallback(() => {
    clearTimers();
    stopSpeaking();
    setSpeaking(false);
    setSpot(null);
    setOnMenu(false);
    setMode("closed");
    // Terminarla y saltarla cuentan igual: quien la saltó ya decidió.
    if (guide) markSeen(guide.id);
  }, [guide, markSeen]);

  const canGo = useCallback(
    (place?: AssistantGuidePlace) => !!place && (!place.path || canEnter(place)),
    [canEnter],
  );

  /**
   * "Llévame ahí": señala dónde está en el menú, entra y resalta el botón.
   *
   * Si el ítem del menú no se ve (menú plegado en el celular, o el conjunto lo
   * llama distinto) entra directo: llegar importa más que la animación.
   */
  const takeMeThere = (index: number) => {
    const place = guide?.steps[index]?.place;
    resetCoach();
    stopSpeaking();
    setStep(index);

    if (!place) {
      setMode("card");
      return;
    }

    setMode("coach");

    const menuSelector =
      place.menuSpot ?? (place.path ? `route:${place.path}` : null);
    const menuElement = menuSelector ? findGuideTarget(menuSelector) : null;

    if (menuElement && !place.menuSpot) {
      const text = (menuElement.textContent ?? "").trim();
      if (text && text.length <= 40) setMenuLabel(text);
    }

    const showPageTarget = () => {
      setOnMenu(false);
      if (place.find) {
        setSpot({ selector: place.find, label: "Empieza aquí" });
      } else if (!place.path && menuSelector) {
        // Sin pantalla a la que ir: lo señalado es el propio sitio.
        setSpot({ selector: menuSelector, label: "Aquí" });
      } else {
        setSpot(null);
      }
    };

    const needsNavigation =
      !!place.path && !matchesRoute(pathname ?? "", place.path);

    if (!needsNavigation) {
      showPageTarget();
      return;
    }

    if (menuElement) {
      setOnMenu(true);
      setSpot({ selector: menuSelector!, label: "Está aquí en el menú" });
      later(() => {
        router.push(place.path!);
        setSpot(null);
        later(showPageTarget, PAGE_SETTLE_MS);
      }, MENU_HIGHLIGHT_MS);
      return;
    }

    router.push(place.path!);
    later(showPageTarget, PAGE_SETTLE_MS);
  };

  const total = guide?.steps.length ?? 0;
  const current = guide?.steps[step];
  const isLast = step === total - 1;

  const go = useCallback(
    (delta: number) => {
      setStep((prev) => Math.min(Math.max(prev + delta, 0), total - 1));
    },
    [total],
  );

  /** "Siguiente" del acompañante: si el paso que sigue tiene pantalla, va a ella. */
  const coachNext = () => {
    const next = step + 1;
    if (next >= total) {
      resetCoach();
      setMode("card");
      return;
    }
    const nextPlace = guide?.steps[next]?.place;
    if (nextPlace && canGo(nextPlace)) {
      takeMeThere(next);
    } else {
      resetCoach();
      setStep(next);
      setMode("card");
    }
  };

  const backToCard = () => {
    resetCoach();
    setMode("card");
  };

  // Lary dice el paso en voz alta mientras la voz esté activa.
  useEffect(() => {
    if (mode === "closed" || !voice || !current) return;

    const text =
      mode === "coach" && current.place
        ? `${current.title}. ${current.place.howTo.join(". ")}`
        : `${current.title}. ${current.text}${
            current.points?.length ? `. ${current.points.join(". ")}` : ""
          }`;

    speak(text, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
  }, [mode, voice, current]);

  useEffect(() => {
    if (mode !== "card") return;
    nextRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, close, go]);

  useEffect(
    () => () => {
      clearTimers();
      stopSpeaking();
    },
    [],
  );

  const toggleVoice = () => {
    setVoice((on) => {
      if (on) {
        stopSpeaking();
        setSpeaking(false);
      }
      return !on;
    });
  };

  if (!guide || !current) return null;

  const place = current.place;
  const reachable = canGo(place);
  const lary = <LaryAvatar state={speaking ? "speaking" : "idle"} size={44} />;

  const voiceButton = (
    <button
      type="button"
      onClick={toggleVoice}
      aria-pressed={voice}
      title={voice ? "Silenciar a Lary" : "Que Lary te lo lea"}
      className={`rounded-xl px-2.5 py-1.5 text-sm transition ${
        voice ? "bg-cyan-500/20 text-cyan-200" : "text-slate-300 hover:bg-white/10"
      }`}
    >
      {voice ? "🔊" : "🔈"}
    </button>
  );

  return (
    <>
      {mode === "coach" && spot ? (
        <LarySpotlight
          selector={spot.selector}
          label={spot.label}
          onResolved={(element) => {
            if (!onMenu && place?.find && spot.selector === place.find) {
              setMissing(!element);
            }
          }}
        />
      ) : null}

      <AnimatePresence>
        {/* ── Modo acompañante: Lary en una esquina, la página libre ── */}
        {mode === "coach" && place ? (
          <motion.div
            key={`coach-${step}`}
            data-lary-guide
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-[10045] w-auto max-w-sm overflow-hidden rounded-2xl border border-cyan-400/30 bg-slate-900/95 text-white shadow-2xl backdrop-blur-xl sm:right-auto"
            role="dialog"
            aria-label={`Guía: ${current.title}`}
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-2.5">
              {lary}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {current.icon} {current.title}
                </p>
                <p className="text-xs text-slate-400">
                  Paso {step + 1} de {total}
                </p>
              </div>
              {voiceButton}
              <button
                type="button"
                onClick={close}
                aria-label="Terminar la guía"
                title="Terminar la guía"
                className="rounded-xl px-2.5 py-1.5 text-sm text-slate-300 transition hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[45dvh] overflow-y-auto px-4 py-3">
              <p className="mb-2 rounded-lg bg-cyan-400/10 px-2.5 py-1.5 text-xs text-cyan-100">
                📍 {menuLabel ? `${menuName} → ${menuLabel}` : place.menu}
              </p>

              {onMenu ? (
                <p className="text-sm text-slate-300">
                  Mira dónde está en el menú… ya te llevo 👀
                </p>
              ) : (
                <ol className="space-y-2">
                  {place.howTo.map((line, index) => (
                    <li key={line} className="flex gap-2 text-sm text-slate-200">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-[11px] font-bold text-slate-950">
                        {index + 1}
                      </span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ol>
              )}

              {missing ? (
                <p className="mt-2 text-xs text-amber-300">
                  No encuentro ese botón en esta pantalla: puede que tu plan o tu
                  rol no lo incluyan todavía.
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-2 border-t border-white/10 px-4 py-2.5">
              <button
                type="button"
                onClick={backToCard}
                className="rounded-xl px-2 py-1.5 text-xs text-slate-400 transition hover:text-white"
              >
                ← Ver la guía
              </button>
              <button
                type="button"
                onClick={coachNext}
                className="ml-auto rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                {isLast ? "Terminar" : "Siguiente →"}
              </button>
            </div>
          </motion.div>
        ) : null}

        {/* ── Modo tarjeta ── */}
        {mode === "card" ? (
          <motion.div
            key="lary-guide"
            data-lary-guide
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10050] flex items-end justify-center bg-slate-950/80 p-4 backdrop-blur-sm sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lary-guide-title"
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              className="relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900 text-white shadow-2xl"
            >
              {/* Cabecera: Lary y el nombre de la guía */}
              <div className="flex items-center gap-3 border-b border-white/10 px-5 py-3">
                {lary}
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-cyan-300/80">
                    {guide.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    Paso {step + 1} de {total}
                  </p>
                </div>

                <div className="ml-auto flex items-center gap-1">
                  {voiceButton}
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Cerrar guía"
                    title="Cerrar guía"
                    className="rounded-xl px-2.5 py-1.5 text-sm text-slate-300 transition hover:bg-white/10"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Paso actual */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ x: 16, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -16, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {step === 0 ? (
                      <div className="mb-4 flex justify-center">
                        <LaryAvatar
                          state={speaking ? "speaking" : "idle"}
                          size={150}
                        />
                      </div>
                    ) : (
                      <div className="mb-3 text-4xl" aria-hidden="true">
                        {current.icon}
                      </div>
                    )}

                    <h2
                      id="lary-guide-title"
                      className={`text-xl font-semibold leading-snug ${
                        step === 0 ? "text-center" : ""
                      }`}
                    >
                      {current.title}
                    </h2>
                    <p
                      className={`mt-2 text-[15px] leading-relaxed text-slate-300 ${
                        step === 0 ? "text-center" : ""
                      }`}
                    >
                      {current.text}
                    </p>

                    {current.points?.length ? (
                      <ul className="mt-4 space-y-2">
                        {current.points.map((point) => (
                          <li
                            key={point}
                            className="flex gap-2 rounded-xl border border-white/5 bg-white/[0.04] px-3 py-2 text-sm text-slate-200"
                          >
                            <span className="text-cyan-300" aria-hidden="true">
                              •
                            </span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    {/* Dónde está y cómo llegar */}
                    {place ? (
                      <div className="mt-4 rounded-2xl border border-cyan-400/25 bg-cyan-400/[0.06] p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
                          📍 Dónde está
                        </p>
                        <p className="mt-1 text-sm text-slate-100">{place.menu}</p>

                        {reachable ? (
                          <button
                            type="button"
                            onClick={() => takeMeThere(step)}
                            className="mt-3 w-full rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                          >
                            {place.path ? "👉 Llévame ahí y muéstrame" : "👉 Muéstrame dónde"}
                          </button>
                        ) : (
                          <p className="mt-2 text-xs text-amber-300">
                            Tu plan o tu rol todavía no incluyen esta sección.
                          </p>
                        )}
                      </div>
                    ) : current.elsewhere ? (
                      <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300">
                        📱 Esto lo haces desde la app del celular.
                      </p>
                    ) : null}

                    {isLast ? (
                      <p className="mt-5 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.07] px-3 py-2 text-sm text-cyan-100">
                        📖 {guide.reopenHint}
                      </p>
                    ) : null}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Progreso y botones */}
              <div className="border-t border-white/10 px-5 py-4">
                <div className="mb-3 flex justify-center gap-1.5" aria-hidden="true">
                  {guide.steps.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      tabIndex={-1}
                      onClick={() => setStep(index)}
                      className={`h-1.5 rounded-full transition-all ${
                        index === step
                          ? "w-6 bg-cyan-400"
                          : "w-1.5 bg-white/20 hover:bg-white/40"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {!isLast ? (
                    <button
                      type="button"
                      onClick={close}
                      className="rounded-xl px-3 py-2 text-sm text-slate-400 transition hover:text-white"
                    >
                      Saltar guía
                    </button>
                  ) : null}

                  <div className="ml-auto flex gap-2">
                    {step > 0 ? (
                      <button
                        type="button"
                        onClick={() => go(-1)}
                        className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                      >
                        Atrás
                      </button>
                    ) : null}
                    <button
                      ref={nextRef}
                      type="button"
                      onClick={() => (isLast ? close() : go(1))}
                      className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
                        place && reachable
                          ? "border border-white/10 text-slate-200 hover:bg-white/10"
                          : "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                      }`}
                    >
                      {isLast ? "¡Empezar!" : step === 0 ? "Muéstrame" : "Siguiente"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
