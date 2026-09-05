"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  InputField,
  Modal,
  SelectField,
  Table,
  Title,
  Text,
} from "complexes-next-components";
import Link from "next/link";
import { useComercioGuard } from "../_lib/comercio-auth";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  ComercioDelivery,
  SHIFT_LABELS,
  SHIFT_TONE,
  createDelivery,
  deactivateDelivery,
  getDeliveries,
  reactivateDelivery,
  resendInvitation,
} from "./services/comercioDeliveryService";
import { getBranches } from "../branches/services/comercioBranchService";

const emptyForm = {
  branchId: "",
  fullName: "",
  email: "",
  phone: "",
  indicative: "",
  vehicleType: "",
  licensePlate: "",
};

const vehicleOptions = [
  { label: "Motocicleta", value: "motorcycle" },
  { label: "Carro", value: "car" },
  { label: "Bicicleta", value: "bicycle" },
  { label: "A pie", value: "walking" },
  { label: "Camioneta", value: "van" },
];

export default function ComercioDeliveriesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [filterBranchId, setFilterBranchId] = useState("");
  useComercioGuard(() => router.push("/comercio/login"));

  const deliveriesQuery = useQuery({
    queryKey: ["comercio-deliveries", filterBranchId],
    queryFn: () => getDeliveries(filterBranchId || undefined),
  });

  const branchesQuery = useQuery({
    queryKey: ["comercio-branches"],
    queryFn: getBranches,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createDelivery({
        branchId: form.branchId,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        indicative: form.indicative || undefined,
        vehicleType: (form.vehicleType || undefined) as
          | ComercioDelivery["vehicleType"]
          | undefined,
        licensePlate: form.licensePlate || undefined,
      }),
    onSuccess: () => {
      showAlert(
        "Repartidor registrado. Le enviamos una invitación para que cree su contraseña.",
        "success",
      );
      queryClient.invalidateQueries({ queryKey: ["comercio-deliveries"] });
      closeModal();
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const resendMutation = useMutation({
    mutationFn: (id: string) => resendInvitation(id),
    onSuccess: () =>
      showAlert("Invitación reenviada", "success"),
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive ? deactivateDelivery(id) : reactivateDelivery(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comercio-deliveries"] });
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  function closeModal() {
    setIsModalOpen(false);
    setForm(emptyForm);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate();
  }

  const deliveries = deliveriesQuery.data ?? [];

  const vehicleLabel: Record<string, string> = {
    motorcycle: "Motocicleta",
    car: "Carro",
    bicycle: "Bicicleta",
    walking: "A pie",
    van: "Camioneta",
  };

  const branches = branchesQuery.data ?? [];
  const branchOptions = branches.map((branch) => ({
    label: branch.name,
    value: branch.id,
  }));

  const headers = [
    "Nombre",
    "Email",
    "Teléfono",
    "Vehículo",
    "Turno",
    "Sedes",
    "Estado",
    "",
  ];

  const rows = deliveries.map((delivery) => [
    delivery.fullName,
    delivery.email,
    delivery.phone,
    delivery.vehicleType ? vehicleLabel[delivery.vehicleType] : "-",
    // El turno lo declara él desde su app. Es lo que convierte la asignación
    // de un pedido en una decisión informada en vez de una lista de nombres.
    <span
      key={`shift-${delivery.id}`}
      className={`text-xs ${SHIFT_TONE[delivery.shiftStatus]}`}
    >
      {SHIFT_LABELS[delivery.shiftStatus]}
    </span>,
    <span key={`branches-${delivery.id}`} className="text-xs">
      {delivery.branches.length}
    </span>,
    // "Sin activar" no es lo mismo que "inactivo": el primero todavía no ha
    // puesto su contraseña y no puede entrar aunque el comercio lo crea listo.
    !delivery.activated ? (
      <Badge key={delivery.id} colVariant="warning" size="xs">
        Sin activar
      </Badge>
    ) : (
      <Badge
        key={delivery.id}
        colVariant={delivery.isActive ? "success" : "danger"}
        size="xs"
      >
        {delivery.isActive ? "Activo" : "Inactivo"}
      </Badge>
    ),
    <div key={`actions-${delivery.id}`} className="flex gap-2 flex-wrap">
      {!delivery.activated && (
        <Button
          size="xs"
          rounded="md"
          colVariant="primary"
          disabled={resendMutation.isPending}
          onClick={() => resendMutation.mutate(delivery.id)}
        >
          Reenviar invitación
        </Button>
      )}
      <Button
        size="xs"
        rounded="md"
        colVariant={delivery.isActive ? "warning" : "success"}
        onClick={() =>
          toggleActiveMutation.mutate({
            id: delivery.id,
            isActive: delivery.isActive,
          })
        }
      >
        {delivery.isActive ? "Desvincular" : "Revincular"}
      </Button>
    </div>,
  ]);

  const cellClasses = rows.map(() =>
    headers.map(() => "bg-white text-gray-700 px-3 py-2"),
  );

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/comercio/dashboard" className="text-cyan-400 text-sm">
              ← Volver al panel
            </Link>
            <Title
              as="h1"
              size="lg"
              colVariant="on"
              font="semi"
              className="mt-2"
            >
              Repartidores
            </Title>
          </div>
          <Button
            colVariant="success"
            rounded="md"
            onClick={() => setIsModalOpen(true)}
          >
            + Registrar repartidor
          </Button>
        </div>

        {branchOptions.length > 0 && (
          <div className="mb-4 max-w-xs">
            <SelectField
              options={branchOptions}
              defaultOption="Todas las sucursales"
              value={filterBranchId}
              onChange={(e) => setFilterBranchId(e.target.value)}
              helpText="Filtrar por sucursal"
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
            />
          </div>
        )}

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl overflow-x-auto">
          {deliveriesQuery.isLoading ? (
            <Text size="sm" className="text-slate-400 p-4">Cargando repartidores...</Text>
          ) : deliveries.length === 0 ? (
            <Text size="sm" className="text-slate-400 p-4">
              Aún no tienes repartidores registrados.
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
        title="Registrar repartidor"
        className="w-[920px]"
      >
        <form onSubmit={handleSubmit} className="space-y-4 p-2">
          {branches.length === 0 ? (
            <Text size="sm" colVariant="warning">
              Aún no tienes sucursales.{" "}
              <Link href="/comercio/branches" className="underline">
                Crea una sucursal
              </Link>{" "}
              antes de registrar repartidores.
            </Text>
          ) : (
            <SelectField
              options={branchOptions}
              defaultOption="Selecciona una sucursal"
              value={form.branchId}
              onChange={(e) => setForm({ ...form, branchId: e.target.value })}
              helpText="Sucursal"
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
              required
            />
          )}

          <InputField
            regexType="letters"
            placeholder="Nombre completo"
            sizeHelp="xs"
            inputSize="md"
            rounded="md"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />

          <InputField
            regexType="email"
            placeholder="Correo electrónico"
            type="email"
            sizeHelp="xs"
            inputSize="md"
            rounded="md"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          {/* Ya no se pide contraseña: el repartidor la crea desde el enlace
              que le llega al correo. Que la escribiera el comercio significaba
              que el dueño conocía la credencial de quien firma entregas en su
              nombre. */}
          <Text size="xs" className="text-slate-400">
            Le enviaremos una invitación a ese correo para que cree su propia
            contraseña. Mientras no la cree, aparecerá como “sin activar”.
          </Text>

          <div className="flex gap-3">
            <InputField
              regexType="phone"
              placeholder="Indicativo"
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
              value={form.indicative}
              onChange={(e) => setForm({ ...form, indicative: e.target.value })}
            />
            <InputField
              regexType="phone"
              placeholder="Teléfono"
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>

          <SelectField
            options={vehicleOptions}
            defaultOption="Tipo de vehículo (opcional)"
            value={form.vehicleType}
            onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
            sizeHelp="xs"
            inputSize="md"
            rounded="md"
          />

          <InputField
            regexType="alphanumeric"
            placeholder="Placa (opcional)"
            sizeHelp="xs"
            inputSize="md"
            rounded="md"
            value={form.licensePlate}
            onChange={(e) => setForm({ ...form, licensePlate: e.target.value })}
          />

          <Button
            type="submit"
            colVariant="success"
            size="full"
            rounded="md"
            disabled={createMutation.isPending || branches.length === 0}
          >
            {createMutation.isPending ? "Guardando..." : "Registrar repartidor"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
