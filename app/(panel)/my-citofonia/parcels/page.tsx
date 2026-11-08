"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { MdInventory2 } from "react-icons/md";
import { Button } from "complexes-next-components";
import { route } from "@/app/_domain/constants/routes";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { ui } from "@/app/(panel)/my-b2b/_components/b2b-ui";
import { useVisitSocket } from "../hooks/useVisitSocket";
import {
  ExpectedParcel,
  getCashSettings,
  getExpectedParcels,
  getOpenCash,
  getParcels,
  money,
  ParcelCashRow,
  updateCashSettings,
  Parcel,
  ParcelPage,
  ParcelStatus,
} from "../services/parcelService";
import CloseParcelModal from "./_components/close-parcel-modal";
import ExpectedCard from "./_components/expected-card";
import CashCard from "./_components/cash-card";
import { ReceiveCashModal, ReturnCashModal } from "./_components/cash-modals";
import { useSidebarInformation } from "@/app/components/ui/sidebar-information";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import ParcelCard from "./_components/parcel-card";
import RegisterParcelModal from "./_components/register-parcel-modal";

type Tab = "pending" | "expected" | "cash" | "history";

/** Lo que avisan los residentes no llega por socket: basta con refrescarlo. */
const EXPECTED_REFRESH_MS = 60_000;

const PAGE_SIZE = 20;

/** Espera tras la última tecla antes de buscar. */
const SEARCH_DELAY_MS = 300;

const STATUS_BY_TAB: Record<Tab, ParcelStatus | undefined> = {
  pending: "PENDING",
  expected: "PENDING",
  cash: "PENDING",
  history: undefined,
};

/**
 * Los paquetes que llegan a la portería. No son visitas: el mensajero se va y
 * el paquete se queda, así que lo que importa es qué sigue guardado y quién se
 * lo llevó.
 */
export default function ParcelsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  const [tab, setTab] = useState<Tab>("pending");
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(1);
  const [registering, setRegistering] = useState(false);
  // El aviso del residente con que se abre el registro, si se abrió desde ahí.
  const [registerFor, setRegisterFor] = useState<ExpectedParcel | null>(null);
  const [receivingCash, setReceivingCash] = useState(false);
  const [cashFor, setCashFor] = useState<ExpectedParcel | null>(null);
  const [returning, setReturning] = useState<ParcelCashRow | null>(null);

  const showAlert = useAlertStore((s) => s.showAlert);
  const { valueState } = useSidebarInformation();
  // Permitir plata en portería lo decide la administración, no la reja.
  const isAdmin = valueState.userRolName.includes("employee");
  const [closing, setClosing] = useState<{
    parcel: Parcel;
    action: "deliver" | "cancel";
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTerm(search);
      setPage(1);
    }, SEARCH_DELAY_MS);

    return () => clearTimeout(timer);
  }, [search]);

  // Otra portería pudo recibir o entregar uno mientras esta pantalla está abierta.
  useVisitSocket({
    onParcelChanged: () => {
      queryClient.invalidateQueries({ queryKey: ["parcels"] });
      queryClient.invalidateQueries({ queryKey: ["parcel-expected"] });
    },
  });

  const { data: expected = [] } = useQuery<ExpectedParcel[]>({
    queryKey: ["parcel-expected", conjuntoId],
    queryFn: () => getExpectedParcels(conjuntoId),
    enabled: !!conjuntoId,
    refetchInterval: EXPECTED_REFRESH_MS,
  });

  const { data: cashSettings } = useQuery({
    queryKey: ["parcel-cash", "settings", conjuntoId],
    queryFn: () => getCashSettings(conjuntoId),
    enabled: !!conjuntoId,
  });

  const cashEnabled = cashSettings?.enabled === true;

  const { data: openCash } = useQuery({
    queryKey: ["parcel-cash", "open", conjuntoId],
    queryFn: () => getOpenCash(conjuntoId),
    enabled: !!conjuntoId,
    refetchInterval: EXPECTED_REFRESH_MS,
  });

  const cashItems = openCash?.items ?? [];
  // Apagado, la pestaña sigue mientras quede plata por devolver.
  const showCashTab = cashEnabled || cashItems.length > 0;

  const toggleCash = async (enabled: boolean) => {
    if (
      enabled &&
      !window.confirm(
        "Portería podrá recibir dinero de los residentes para pagar paquetes contraentrega. Cada entrega queda a nombre del celador que la recibe. ¿Lo activas?",
      )
    ) {
      return;
    }

    try {
      await updateCashSettings(conjuntoId, enabled);
      queryClient.invalidateQueries({ queryKey: ["parcel-cash"] });
    } catch (e) {
      showAlert((e as Error).message, "error");
    }
  };

  const openReceiveCash = (from: ExpectedParcel | null) => {
    setCashFor(from);
    setReceivingCash(true);
  };

  const needle = term.trim().toLowerCase();
  const expectedShown = needle
    ? expected.filter((item) =>
        [item.apartment, item.tower, item.carrier, item.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(needle),
      )
    : expected;

  const openRegister = (from: ExpectedParcel | null) => {
    setRegisterFor(from);
    setRegistering(true);
  };

  const { data, isLoading, error } = useQuery<ParcelPage>({
    queryKey: ["parcels", conjuntoId, tab, term, page],
    queryFn: () =>
      getParcels(conjuntoId, {
        status: STATUS_BY_TAB[tab],
        search: term,
        page,
        limit: PAGE_SIZE,
      }),
    enabled: !!conjuntoId,
    keepPreviousData: true,
  });

  const changeTab = (next: Tab) => {
    setTab(next);
    setPage(1);
  };

  const parcels = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const tabClass = (active: boolean) =>
    `rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
      active
        ? "border-cyan-700 bg-cyan-700 text-white"
        : "border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/[0.06]"
    }`;

  return (
    <div className="p-4">
      <button
        type="button"
        onClick={() => router.push(route.mycitofonia)}
        className={`text-sm ${ui.link}`}
      >
        ← Volver a citofonía
      </button>

      <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className={`text-xl font-bold sm:text-2xl ${ui.title}`}>
            Paquetes
          </h1>
          <p className={`mt-1 text-sm ${ui.muted}`}>
            Registra lo que dejan en portería: a la unidad le llega el aviso y
            queda constancia de quién se lo llevó.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          rounded="md"
          colVariant="primary"
          onClick={() => openRegister(null)}
        >
          Registrar paquete
        </Button>
      </div>

      {isAdmin && (
        <label className={`mt-3 flex items-start gap-2 text-sm ${ui.text}`}>
          <input
            type="checkbox"
            className="mt-1"
            checked={cashEnabled}
            onChange={(event) => void toggleCash(event.target.checked)}
          />
          <span>
            Portería puede recibir dinero de los residentes para pagar paquetes
            contraentrega.
            <span className={`block text-xs ${ui.muted}`}>
              Apagado por defecto. Cada entrega queda a nombre del celador y la
              unidad la confirma en la app.
            </span>
          </span>
        </label>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={tabClass(tab === "pending")}
          onClick={() => changeTab("pending")}
        >
          En portería{data ? ` (${data.pending})` : ""}
        </button>
        <button
          type="button"
          className={tabClass(tab === "expected")}
          onClick={() => changeTab("expected")}
        >
          Esperados ({expected.length})
        </button>
        {showCashTab && (
          <button
            type="button"
            className={tabClass(tab === "cash")}
            onClick={() => changeTab("cash")}
          >
            Dinero ({cashItems.length})
          </button>
        )}
        <button
          type="button"
          className={tabClass(tab === "history")}
          onClick={() => changeTab("history")}
        >
          Historial
        </button>

        <input
          className={`${ui.input} max-w-xs md:ml-auto`}
          value={search}
          placeholder="Buscar apartamento, guía, transportadora…"
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-300">
          {(error as Error).message}
        </p>
      )}

      {isLoading && (
        <p className={`mt-4 text-sm ${ui.muted}`}>Cargando paquetes…</p>
      )}

      {tab === "expected" && (
        <>
          {expectedShown.length === 0 ? (
            <div className={`${ui.card} mt-4 flex flex-col items-center gap-2 p-8`}>
              <MdInventory2 className={`text-3xl ${ui.faint}`} />
              <p className={`text-sm ${ui.muted}`}>
                {needle
                  ? "Ningún aviso coincide con la búsqueda."
                  : "Ningún residente ha avisado que espera un paquete."}
              </p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {expectedShown.map((item) => (
                <ExpectedCard
                  key={item.id}
                  expected={item}
                  onArrived={(chosen) => openRegister(chosen)}
                  onReceiveCash={
                    cashEnabled ? (chosen) => openReceiveCash(chosen) : undefined
                  }
                />
              ))}
            </div>
          )}
        </>
      )}

      {tab === "cash" && (
        <>
          <div className={`${ui.card} mt-4 flex flex-wrap items-center justify-between gap-3 p-4`}>
            <div>
              <p className={`text-sm font-bold ${ui.strong}`}>
                En portería: {money(openCash?.heldTotal ?? 0)}
              </p>
              <p className={`text-xs ${ui.muted}`}>
                Lo que los residentes dejaron y todavía no se ha pagado ni
                devuelto. Cada entrega está a nombre de quien la recibió.
              </p>
            </div>
            {cashEnabled && (
              <Button
                type="button"
                size="sm"
                rounded="md"
                colVariant="primary"
                onClick={() => openReceiveCash(null)}
              >
                Recibir dinero
              </Button>
            )}
          </div>

          {cashItems.length === 0 ? (
            <p className={`mt-4 text-sm ${ui.muted}`}>
              No hay dinero de residentes en portería.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {cashItems.map((item) => (
                <CashCard key={item.id} cash={item} onReturn={setReturning} />
              ))}
            </div>
          )}
        </>
      )}

      {tab !== "expected" && tab !== "cash" && !isLoading && !error && parcels.length === 0 && (
        <div className={`${ui.card} mt-4 flex flex-col items-center gap-2 p-8`}>
          <MdInventory2 className={`text-3xl ${ui.faint}`} />
          <p className={`text-sm ${ui.muted}`}>
            {term
              ? "Ningún paquete coincide con la búsqueda."
              : tab === "pending"
                ? "No hay paquetes guardados en portería."
                : "Todavía no hay paquetes registrados."}
          </p>
        </div>
      )}

      <div
        className={`mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3 ${tab === "expected" || tab === "cash" ? "hidden" : ""}`}
      >
        {parcels.map((parcel) => (
          <ParcelCard
            key={parcel.id}
            parcel={parcel}
            conjuntoId={conjuntoId}
            onDeliver={(chosen) =>
              setClosing({ parcel: chosen, action: "deliver" })
            }
            onCancel={(chosen) =>
              setClosing({ parcel: chosen, action: "cancel" })
            }
          />
        ))}
      </div>

      {tab !== "expected" && tab !== "cash" && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            className={tabClass(false)}
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Anterior
          </button>
          <span className={`text-sm ${ui.muted}`}>
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            className={tabClass(false)}
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Siguiente
          </button>
        </div>
      )}

      <ReceiveCashModal
        isOpen={receivingCash}
        conjuntoId={conjuntoId}
        expected={cashFor}
        onClose={() => setReceivingCash(false)}
      />

      <ReturnCashModal
        cash={returning}
        conjuntoId={conjuntoId}
        onClose={() => setReturning(null)}
      />

      <RegisterParcelModal
        isOpen={registering}
        conjuntoId={conjuntoId}
        expected={registerFor}
        onClose={() => setRegistering(false)}
      />

      <CloseParcelModal
        closing={closing}
        conjuntoId={conjuntoId}
        onClose={() => setClosing(null)}
      />
    </div>
  );
}
