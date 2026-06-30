"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  InputField,
  Modal,
  Table,
  Title,
} from "complexes-next-components";
import Link from "next/link";
import { getComercioToken } from "../_lib/comercio-auth";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  createBranch,
  deactivateBranch,
  getBranches,
  reactivateBranch,
} from "./services/comercioBranchService";

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

  useEffect(() => {
    if (!getComercioToken()) {
      router.push("/comercio/login");
    }
  }, [router]);

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
      }),
    onSuccess: () => {
      showAlert("Sucursal creada correctamente", "success");
      queryClient.invalidateQueries({ queryKey: ["comercio-branches"] });
      closeModal();
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
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate();
  }

  const branches = branchesQuery.data ?? [];

  const headers = ["Nombre", "Dirección", "Ciudad", "País", "Estado", ""];
  const rows = branches.map((branch) => [
    branch.name,
    branch.address,
    branch.city,
    branch.country,
    <Badge
      key={branch.id}
      colVariant={branch.isActive ? "success" : "danger"}
      size="xs"
    >
      {branch.isActive ? "Activa" : "Inactiva"}
    </Badge>,
    <Button
      key={`actions-${branch.id}`}
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
            <p className="text-slate-400 p-4">Cargando sucursales...</p>
          ) : branches.length === 0 ? (
            <p className="text-slate-400 p-4">
              Aún no tienes sucursales. Crea la primera para poder registrar
              productos.
            </p>
          ) : (
            <Table headers={headers} rows={rows} colVariant="default" />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Nueva sucursal"
        className="w-[920px]"
      >
        <form onSubmit={handleSubmit} className="space-y-4 p-2">
          <InputField
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
            <InputField
              placeholder="Ciudad"
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              required
            />
            <InputField
              placeholder="País"
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-3">
            <InputField
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
              placeholder="Teléfono (opcional)"
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
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
    </div>
  );
}
