"use client";

import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { FaCheckCircle, FaEraser, FaPenNib, FaRegCircle } from "react-icons/fa";
import { useSignatureResize } from "@/app/hooks/useSignatureResize";
import { useRemoveSignature, useSavedSignature } from "./use-saved-signature";

/**
 * Recorrido mínimo de tinta, en px de pantalla. Antes se pedían dos trazos,
 * y dos puntos cumplían la regla; lo que distingue una firma de un roce es
 * cuánto se dibujó, no en cuántas veces.
 */
const MIN_INK_LENGTH = 200;

export interface SignatureValue {
  /** PNG recortado a la tinta, listo para el PDF. */
  dataUrl: string;
  /** Recién dibujada y con "guardar" marcado: hay que subirla al enviar. */
  remember: boolean;
}

interface Props {
  label?: string;
  /** `null` mientras no haya una firma válida elegida o dibujada. */
  onChange: (value: SignatureValue | null) => void;
  /** Al llegar, el campo se pinta en rojo y se desplaza a la vista. */
  error?: string;
}

type Mode = "saved" | "draw";

const inkLength = (strokes: { x: number; y: number }[][]) =>
  strokes.reduce(
    (total, points) =>
      total +
      points
        .slice(1)
        .reduce(
          (sum, p, i) => sum + Math.hypot(p.x - points[i].x, p.y - points[i].y),
          0,
        ),
    0,
  );

/**
 * Recorta el lienzo a la tinta, con margen. El recuadro ocupa todo el ancho y
 * sin recortar la firma llegaba al PDF como un garabato diminuto en medio de
 * una franja vacía; el recorte de la librería, además, la deja pegada al borde.
 */
function trimmedDataUrl(canvas: HTMLCanvasElement, padding = 12): string {
  const { width, height } = canvas;
  const ctx = canvas.getContext("2d");
  if (!ctx || !width || !height) return canvas.toDataURL("image/png");

  const { data } = ctx.getImageData(0, 0, width, height);
  let top = height;
  let left = width;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] === 0) continue;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }

  if (right < 0) return canvas.toDataURL("image/png");

  left = Math.max(0, left - padding);
  top = Math.max(0, top - padding);
  right = Math.min(width - 1, right + padding);
  bottom = Math.min(height - 1, bottom + padding);

  const crop = document.createElement("canvas");
  crop.width = right - left + 1;
  crop.height = bottom - top + 1;
  crop
    .getContext("2d")
    ?.drawImage(
      canvas,
      left,
      top,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height,
    );

  return crop.toDataURL("image/png");
}

export default function SignatureField({
  label = "Firma",
  onChange,
  error,
}: Props) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const fieldRef = useRef<HTMLDivElement>(null);

  const { data: saved, isLoading } = useSavedSignature();
  const removeSignature = useRemoveSignature();

  // Con firma guardada se empieza sin elegir: firmar es un acto, no un default.
  const [chosen, setChosen] = useState<Mode | null>(null);
  const [started, setStarted] = useState(false);
  const [ink, setInk] = useState(0);
  const [drawnUrl, setDrawnUrl] = useState<string | null>(null);
  // `null` = lo que toque por defecto: guardar si no tiene ninguna, no
  // reemplazar la que ya tiene sin que lo pida.
  const [rememberChoice, setRememberChoice] = useState<boolean | null>(null);

  const mode: Mode | null = saved ? chosen : "draw";
  const remember = rememberChoice ?? !saved;
  const isValid = ink >= MIN_INK_LENGTH;
  const ready = mode === "saved" || (mode === "draw" && isValid);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (mode === "saved" && saved) {
      onChangeRef.current({ dataUrl: saved, remember: false });
    } else if (mode === "draw" && drawnUrl && isValid) {
      onChangeRef.current({ dataUrl: drawnUrl, remember });
    } else {
      onChangeRef.current(null);
    }
  }, [mode, saved, drawnUrl, isValid, remember]);

  useEffect(() => {
    if (error) {
      fieldRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [error]);

  const resetDrawing = () => {
    sigCanvas.current?.clear();
    setStarted(false);
    setInk(0);
    setDrawnUrl(null);
  };

  const choose = (next: Mode) => {
    resetDrawing();
    setChosen(next);
  };

  const sigBoxRef = useSignatureResize(sigCanvas, (pad) => {
    if (!pad.isEmpty()) setDrawnUrl(trimmedDataUrl(pad.getCanvas()));
  });

  const handleEnd = () => {
    const pad = sigCanvas.current;
    if (!pad || pad.isEmpty()) return;

    setInk(inkLength(pad.toData()));
    setDrawnUrl(trimmedDataUrl(pad.getCanvas()));
  };

  const handleRemoveSaved = () => {
    removeSignature.mutate(undefined, {
      onSuccess: () => setChosen(null),
    });
  };

  const boxState = error
    ? "border-red-400 bg-red-50/40"
    : isValid
      ? "border-solid border-emerald-400 bg-white"
      : "border-cyan-400 bg-white";

  return (
    <div ref={fieldRef} className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-gray-700">
          {label} <span className="text-red-500">*</span>
        </span>

        {ready ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            <FaCheckCircle size={12} /> Firma lista
          </span>
        ) : (
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            Obligatoria
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="h-24 w-full animate-pulse rounded-2xl bg-gray-100" />
      ) : (
        saved && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => choose("saved")}
                aria-pressed={mode === "saved"}
                className={`flex flex-col gap-2 rounded-2xl border-2 p-3 text-left transition ${
                  mode === "saved"
                    ? "border-emerald-400 bg-emerald-50/50"
                    : "border-gray-200 bg-white hover:border-cyan-400"
                }`}
              >
                <div className="flex h-20 w-full items-center justify-center rounded-xl border border-gray-100 bg-gray-50 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={saved}
                    alt="Tu firma guardada"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  {mode === "saved" ? (
                    <FaCheckCircle className="shrink-0 text-emerald-500" />
                  ) : (
                    <FaRegCircle className="shrink-0 text-gray-400" />
                  )}
                  Usar mi firma guardada
                </span>
              </button>

              <button
                type="button"
                onClick={() => choose("draw")}
                aria-pressed={mode === "draw"}
                className={`flex flex-col gap-2 rounded-2xl border-2 p-3 text-left transition ${
                  mode === "draw"
                    ? "border-cyan-400 bg-cyan-50/50"
                    : "border-gray-200 bg-white hover:border-cyan-400"
                }`}
              >
                <div className="flex h-20 w-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-cyan-600">
                  <FaPenNib size={22} />
                </div>
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  {mode === "draw" ? (
                    <FaCheckCircle className="shrink-0 text-cyan-500" />
                  ) : (
                    <FaRegCircle className="shrink-0 text-gray-400" />
                  )}
                  Firmar de nuevo
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleRemoveSaved}
              disabled={removeSignature.isLoading}
              className="text-xs text-gray-500 hover:text-red-600 hover:underline disabled:opacity-50"
            >
              Borrar mi firma guardada
            </button>
          </>
        )
      )}

      {!isLoading && mode === "draw" && (
        <>
          <div
            ref={sigBoxRef}
            className={`relative h-52 w-full overflow-hidden rounded-2xl border-2 border-dashed transition-colors sm:h-60 ${boxState}`}
            style={{ touchAction: "none" }}
          >
            {/* Línea de firma: le dice dónde y de qué tamaño firmar. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-6 bottom-12 flex items-end gap-2 text-gray-300 sm:inset-x-10"
            >
              <span className="text-lg leading-none">✕</span>
              <span className="flex-1 border-b-2 border-gray-300" />
            </div>

            <SignatureCanvas
              ref={sigCanvas}
              penColor="#111827"
              minWidth={1}
              maxWidth={2.8}
              onBegin={() => setStarted(true)}
              onEnd={handleEnd}
              clearOnResize={false}
              canvasProps={{
                "aria-label": "Recuadro para dibujar tu firma",
                className:
                  "relative z-10 block h-full w-full cursor-crosshair bg-transparent",
              }}
            />

            {!started && (
              <div className="pointer-events-none absolute inset-0 z-20 flex select-none flex-col items-center justify-center gap-2 px-4 pb-10 text-center">
                <span className="flex size-12 animate-pulse items-center justify-center rounded-full bg-cyan-50 text-cyan-600">
                  <FaPenNib size={20} />
                </span>
                <span className="text-base font-semibold text-gray-700 sm:text-lg">
                  Firma aquí
                </span>
                <span className="max-w-sm text-xs text-gray-500 sm:text-sm">
                  Haz tu firma completa sobre la línea, con el mouse o con el
                  dedo
                </span>
              </div>
            )}

            {started && (
              <button
                type="button"
                onClick={resetDrawing}
                className="absolute right-2 top-2 z-30 inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-red-600 shadow-sm hover:bg-red-50"
              >
                <FaEraser size={12} /> Borrar
              </button>
            )}
          </div>

          {started && !isValid && (
            <div className="space-y-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all"
                  style={{
                    width: `${Math.min(100, (ink / MIN_INK_LENGTH) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-amber-700">
                La firma es muy corta: sigue con un trazo más largo.
              </p>
            </div>
          )}

          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRememberChoice(e.target.checked)}
              className="size-4 accent-cyan-600"
            />
            {saved
              ? "Reemplazar mi firma guardada por esta"
              : "Guardar esta firma para no volver a dibujarla"}
          </label>
        </>
      )}

      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
