"use client";

import { useEffect, useState } from "react";
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
} from "complexes-next-components";
import Link from "next/link";
import { getComercioToken } from "../_lib/comercio-auth";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  ComercioDelivery,
  createDelivery,
  deactivateDelivery,
  getDeliveries,
  reactivateDelivery,
} from "./services/comercioDeliveryService";

const emptyForm = {
  fullName: "",
  email: "",
  password: "",
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

  useEffect(() => {
    if (!getComercioToken()) {
      router.push("/comercio/login");
    }
  }, [router]);

  const deliveriesQuery = useQuery({
    queryKey: ["comercio-deliveries"],
    queryFn: getDeliveries,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createDelivery({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        indicative: form.indicative || undefined,
        vehicleType: (form.vehicleType || undefined) as
          | ComercioDelivery["vehicleType"]
          | undefined,
        licensePlate: form.licensePlate || undefined,
      }),
    onSuccess: () => {
      showAlert("Repartidor registrado correctamente", "success");
      queryClient.invalidateQueries({ queryKey: ["comercio-deliveries"] });
      closeModal();
    },
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

  const headers = ["Nombre", "Email", "Teléfono", "Vehículo", "Estado", ""];
  const rows = deliveries.map((delivery) => [
    delivery.fullName,
    delivery.email,
    delivery.phone,
    delivery.vehicleType ? vehicleLabel[delivery.vehicleType] : "-",
    <Badge
      key={delivery.id}
      colVariant={delivery.isActive ? "success" : "danger"}
      size="xs"
    >
      {delivery.isActive ? "Activo" : "Inactivo"}
    </Badge>,
    <Button
      key={`actions-${delivery.id}`}
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
      {delivery.isActive ? "Desactivar" : "Reactivar"}
    </Button>,
  ]);

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

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl overflow-x-auto">
          {deliveriesQuery.isLoading ? (
            <p className="text-slate-400 p-4">Cargando repartidores...</p>
          ) : deliveries.length === 0 ? (
            <p className="text-slate-400 p-4">
              Aún no tienes repartidores registrados.
            </p>
          ) : (
            <Table headers={headers} rows={rows} colVariant="default" />
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
          <InputField
            placeholder="Nombre completo"
            sizeHelp="xs"
            inputSize="md"
            rounded="md"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />

          <InputField
            placeholder="Correo electrónico"
            type="email"
            sizeHelp="xs"
            inputSize="md"
            rounded="md"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <InputField
            placeholder="Contraseña"
            type="password"
            sizeHelp="xs"
            inputSize="md"
            rounded="md"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            minLength={6}
            required
          />

          <div className="flex gap-3">
            <InputField
              placeholder="Indicativo"
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
              value={form.indicative}
              onChange={(e) => setForm({ ...form, indicative: e.target.value })}
            />
            <InputField
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
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Guardando..." : "Registrar repartidor"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
