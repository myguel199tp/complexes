"use client";

import { FormEvent, useState } from "react";
import { Callout, ui } from "@/app/(panel)/my-b2b/_components/b2b-ui";
import { convivenciaApi } from "../services/convivenciaService";
import { CaseDetail, ConvivenciaMe } from "../services/convivenciaTypes";
import { useConvivenciaMutation } from "./use-convivencia";

interface Props {
  me: ConvivenciaMe;
  onCreated: (caseId: string) => void;
}

/**
 * Radicar un caso. Pide lo mismo que el formulario de Google, salvo lo que ya
 * sale de la cuenta (nombre, cédula, torre, apartamento, correo y tipo de
 * residente).
 */
export default function NewCaseForm({ me, onCreated }: Props) {
  const [relationId, setRelationId] = useState(me.myUnits[0]?.relationId ?? "");
  const [incidentDate, setIncidentDate] = useState("");
  const [phone, setPhone] = useState(me.phone ?? "");
  const [tower, setTower] = useState("");
  const [apartment, setApartment] = useState("");
  const [description, setDescription] = useState("");
  const [summary, setSummary] = useState("");

  const create = useConvivenciaMutation(
    (c, body: Parameters<typeof convivenciaApi.create>[1]) => convivenciaApi.create(c, body),
    "Caso radicado. El comité de convivencia lo recibirá.",
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const created = (await create.mutateAsync({
      petitionerRelationId: relationId || undefined,
      incidentDate: incidentDate || undefined,
      petitionerPhone: phone || undefined,
      respondentTower: tower || undefined,
      respondentApartment: apartment || undefined,
      respondentDescription: description || undefined,
      summary,
    })) as CaseDetail;
    onCreated(created.id);
  };

  const canSubmit = summary.trim().length >= 10 && (apartment.trim() || description.trim());

  return (
    <form onSubmit={submit} className={`${ui.card} space-y-5 p-5`}>
      <Callout tone="info">
        El comité de convivencia media entre las partes y levanta un acta. No
        impone sanciones: si no hay acuerdo, remite el caso a la administración.
      </Callout>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className={`mb-2 text-sm font-semibold ${ui.strong}`}>Tus datos</legend>
        {me.myUnits.length > 1 ? (
          <label className="block">
            <span className={ui.label}>Unidad desde la que radicas</span>
            <select className={ui.input} value={relationId} onChange={(e) => setRelationId(e.target.value)}>
              {me.myUnits.map((u) => (
                <option key={u.relationId} value={u.relationId}>
                  {u.unit} · {u.role}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div>
            <span className={ui.label}>Unidad</span>
            <p className={`text-sm ${ui.strong}`}>
              {me.myUnits[0] ? `${me.myUnits[0].unit} · ${me.myUnits[0].role}` : "Administración"}
            </p>
          </div>
        )}
        <label className="block">
          <span className={ui.label}>Número de contacto</span>
          <input className={ui.input} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className={`mb-2 text-sm font-semibold ${ui.strong}`}>Datos del convocado</legend>
        <label className="block">
          <span className={ui.label}>Torre</span>
          <input className={ui.input} value={tower} onChange={(e) => setTower(e.target.value)} placeholder="7" />
        </label>
        <label className="block">
          <span className={ui.label}>Apartamento</span>
          <input className={ui.input} value={apartment} onChange={(e) => setApartment(e.target.value)} placeholder="323" />
        </label>
        <label className="block sm:col-span-3">
          <span className={ui.label}>Quién es (si no sabes la unidad, o para precisar)</span>
          <input
            className={ui.input}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Arrendatarios del 323, moto de placa YVZ44F…"
          />
        </label>
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className={`mb-2 text-sm font-semibold ${ui.strong}`}>El caso</legend>
        <label className="block sm:max-w-xs">
          <span className={ui.label}>Fecha de los hechos</span>
          <input
            type="date"
            className={`${ui.input} dark:[color-scheme:dark]`}
            value={incidentDate}
            onChange={(e) => setIncidentDate(e.target.value)}
          />
        </label>
        <label className="block">
          <span className={ui.label}>Resumen del caso</span>
          <textarea
            className={`${ui.input} min-h-[140px]`}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Qué pasó, desde cuándo, a quién afecta y qué solicitas."
          />
        </label>
      </fieldset>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!canSubmit || create.isPending}
          className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-50"
        >
          {create.isPending ? "Radicando…" : "Radicar caso"}
        </button>
      </div>
    </form>
  );
}
