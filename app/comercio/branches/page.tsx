"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Modal,
  Table,
  Title,
  Text,
} from "complexes-next-components";
import Link from "next/link";
import { useComercioGuard } from "../_lib/comercio-auth";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useCountryCityOptions } from "@/app/(sets)/registers/_components/register-option";
import {
  ComercioBranch,
  createBranch,
  deactivateBranch,
  getBranches,
  reactivateBranch,
  updateBranch,
} from "./services/comercioBranchService";
import { InputField, SelectField } from "@/app/components/ui/form";
import {
  LocationPicker,
  MapPoint,
  placeSearchQueries,
} from "@/app/components/ui/location-picker";
import BranchLocationModal from "./_components/branch-location-modal";

/** Cómo se ve en la tabla de dónde salió la ubicación de cada sucursal. */
function locationBadge(branch: ComercioBranch) {
  if (branch.locationSource === "pin") {
    return { label: "En el mapa", variant: "success" as const };
  }
  if (branch.locationSource) {
    return { label: "Aproximada", variant: "warning" as const };
  }
  return { label: "Sin ubicar", variant: "danger" as const };
}

const emptyForm = {
  name: "",
  address: "",
  city: "",
  country: "",
  neighborhood: "",
  phone: "",
};

export default function ComercioBranchesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [countryId, setCountryId] = useState("");
  const [cityId, setCityId] = useState("");
  const [pin, setPin] = useState<MapPoint | null>(null);
  const [locating, setLocating] = useState<ComercioBranch | null>(null);

  const { countryOptions, cityOptions, setSelectedCountryId } =
    useCountryCityOptions();
  const selectedCountryOption = countryOptions.find(
    (opt) => opt.value === countryId,
  );
  useComercioGuard(() => router.push("/comercio/login"));

  const branchesQuery = useQuery({
    queryKey: ["comercio-branches"],
    queryFn: getBranches,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createBranch({
        name: form.name,
        address: form.address,
        city: form.city,
        country: form.country,
        neighborhood: form.neighborhood || undefined,
        phone: form.phone || undefined,
        ...(pin ?? {}),
      }),
    onSuccess: () => {
      showAlert("Sucursal creada correctamente", "success");
      queryClient.invalidateQueries({ queryKey: ["comercio-branches"] });
      closeModal();
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const locateMutation = useMutation({
    mutationFn: ({ id, point }: { id: string; point: MapPoint }) =>
      updateBranch(id, point),
    onSuccess: () => {
      showAlert("Ubicación guardada", "success");
      queryClient.invalidateQueries({ queryKey: ["comercio-branches"] });
      setLocating(null);
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive ? deactivateBranch(id) : reactivateBranch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comercio-branches"] });
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  function closeModal() {
    setIsModalOpen(false);
    setForm(emptyForm);
    setCountryId("");
    setCityId("");
    setSelectedCountryId(null);
    setPin(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate();
  }

  const branches = branchesQuery.data ?? [];

  const headers = ["Nombre", "Dirección", "Ciudad", "País", "Ubicación", "Estado", ""];
  const rows = branches.map((branch) => [
    branch.name,
    branch.address,
    branch.city,
    branch.country,
    <Badge
      key={`location-${branch.id}`}
      colVariant={locationBadge(branch).variant}
      size="xs"
    >
      {locationBadge(branch).label}
    </Badge>,
    <Badge
      key={branch.id}
      colVariant={branch.isActive ? "success" : "danger"}
      size="xs"
    >
      {branch.isActive ? "Activa" : "Inactiva"}
    </Badge>,
    <div key={`actions-${branch.id}`} className="flex gap-2">
      <Link href={`/comercio/branches/${branch.id}/conjuntos`}>
        <Button size="xs" rounded="md" colVariant="primary">
          Ver conjuntos
        </Button>
      </Link>
      <Button
        size="xs"
        rounded="md"
        colVariant="primary"
        onClick={() => setLocating(branch)}
      >
        Ubicar
      </Button>
      <Button
        size="xs"
        rounded="md"
        colVariant={branch.isActive ? "warning" : "success"}
        onClick={() =>
          toggleActiveMutation.mutate({
            id: branch.id,
            isActive: branch.isActive,
          })
        }
      >
        {branch.isActive ? "Desactivar" : "Reactivar"}
      </Button>
    </div>,
  ]);

  const cellClasses = rows.map(() =>
    headers.map(() => "bg-white text-gray-700 px-3 py-2"),
  );

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Title
              as="h1"
              size="lg"
              colVariant="on"
              font="semi"
            >
              Sucursales
            </Title>
          </div>
          <Button
            colVariant="success"
            rounded="md"
            onClick={() => setIsModalOpen(true)}
          >
            + Agregar sucursal
          </Button>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl overflow-x-auto">
          {branchesQuery.isLoading ? (
            <Text size="sm" className="text-slate-400 p-4">Cargando sucursales...</Text>
          ) : branches.length === 0 ? (
            <Text size="sm" className="text-slate-400 p-4">
              Aún no tienes sucursales. Crea la primera para poder registrar
              productos.
            </Text>
          ) : (
            <Table
              headers={headers}
              rows={rows}
              cellClasses={cellClasses}
              borderColor="text-gray-300"
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Nueva sucursal"
        className="!w-[94%] md:!w-[920px] max-w-[96vw] max-h-[88vh] overflow-y-auto"
      >
        <form onSubmit={handleSubmit} className="space-y-4 p-2">
          <InputField
            regexType="safeChars"
            placeholder="Nombre de la sucursal"
            sizeHelp="xs"
            inputSize="md"
            rounded="md"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <InputField
            placeholder="Dirección"
            sizeHelp="xs"
            inputSize="md"
            rounded="md"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />

          <div className="flex gap-3">
            <SelectField
              searchable
              defaultOption="Selecciona tu país"
              sizeHelp="xs"
              id="country"
              options={countryOptions}
              inputSize="md"
              rounded="md"
              prefixImage={selectedCountryOption?.image || ""}
              value={countryId}
              onChange={(e) => {
                const id = e.target.value || "";
                const option = countryOptions.find((opt) => opt.value === id);
                setCountryId(id);
                setSelectedCountryId(id || null);
                setCityId("");
                setForm({
                  ...form,
                  country: option?.label ?? "",
                  city: "",
                });
              }}
              required
            />
            <SelectField
              searchable
              defaultOption="Selecciona tu ciudad"
              sizeHelp="xs"
              id="city"
              options={cityOptions}
              inputSize="md"
              rounded="md"
              value={cityId}
              onChange={(e) => {
                const id = e.target.value || "";
                const option = cityOptions.find((opt) => opt.value === id);
                setCityId(id);
                setForm({ ...form, city: option?.label ?? "" });
              }}
              required
            />
          </div>

          <div className="flex gap-3">
            <InputField
              regexType="letters"
              placeholder="Barrio (opcional)"
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
              value={form.neighborhood}
              onChange={(e) =>
                setForm({ ...form, neighborhood: e.target.value })
              }
            />
            <InputField
              regexType="phone"
              placeholder="Teléfono (opcional)"
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <Text size="sm" font="semi" className="text-gray-700">
              Ubicación en el mapa (recomendada)
            </Text>
            <Text size="xs" className="text-gray-500">
              Con el pin medimos bien qué conjuntos te quedan más cerca. Si no lo
              pones, la sacamos de la dirección y queda aproximada.
            </Text>
            {isModalOpen && (
              <LocationPicker
                value={pin}
                onChange={setPin}
                center={null}
                centerQuery={
                  form.city
                    ? [form.city.replace(/\s*\([^()]*\)\s*$/, ""), form.country]
                        .filter(Boolean)
                        .join(", ")
                    : undefined
                }
                searchQueries={placeSearchQueries(form)}
                height={260}
              />
            )}
          </div>

          <Button
            type="submit"
            colVariant="success"
            size="full"
            rounded="md"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Guardando..." : "Crear sucursal"}
          </Button>
        </form>
      </Modal>

      <BranchLocationModal
        branch={locating}
        saving={locateMutation.isPending}
        onClose={() => setLocating(null)}
        onSave={(point) =>
          locating && locateMutation.mutate({ id: locating.id, point })
        }
      />
    </div>
  );
}
