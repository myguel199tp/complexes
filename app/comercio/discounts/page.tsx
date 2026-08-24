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
import DateField from "@/app/components/ui/date-field/DateField";
import {
  ComercioDiscount,
  ComercioDiscountScope,
  ComercioDiscountType,
  createDiscount,
  deactivateDiscount,
  getDiscounts,
  reactivateDiscount,
  updateDiscount,
} from "./services/comercioDiscountService";
import { getBranches } from "../branches/services/comercioBranchService";
import {
  getCategories,
  getProducts,
} from "../products/services/comercioProductService";

const typeOptions = [
  { label: "Porcentaje (%)", value: "PERCENTAGE" },
  { label: "Monto fijo ($)", value: "FIXED" },
];

const scopeOptions = [
  { label: "Todo el pedido", value: "ORDER" },
  { label: "Una categoría", value: "CATEGORY" },
  { label: "Productos específicos", value: "ITEM" },
];

const scopeLabel: Record<ComercioDiscountScope, string> = {
  ORDER: "Todo el pedido",
  CATEGORY: "Categoría",
  ITEM: "Productos",
};

const emptyForm = {
  branchId: "",
  name: "",
  discountType: "PERCENTAGE" as ComercioDiscountType,
  value: "",
  scope: "ORDER" as ComercioDiscountScope,
  categoryId: "",
  productIds: [] as string[],
  startDate: "",
  endDate: "",
};

export default function ComercioDiscountsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] =
    useState<ComercioDiscount | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterBranchId, setFilterBranchId] = useState("");
  useComercioGuard(() => router.push("/comercio/login"));

  const discountsQuery = useQuery({
    queryKey: ["comercio-discounts", filterBranchId],
    queryFn: () => getDiscounts(filterBranchId || undefined),
  });

  const branchesQuery = useQuery({
    queryKey: ["comercio-branches"],
    queryFn: getBranches,
  });

  const categoriesQuery = useQuery({
    queryKey: ["comercio-categories"],
    queryFn: getCategories,
  });

  const productsQuery = useQuery({
    queryKey: ["comercio-products", form.branchId],
    queryFn: () => getProducts(form.branchId || undefined),
  });

  function buildPayload() {
    return {
      branchId: form.branchId,
      name: form.name,
      discountType: form.discountType,
      value: Number(form.value),
      scope: form.scope,
      categoryId: form.scope === "CATEGORY" ? form.categoryId : undefined,
      productIds: form.scope === "ITEM" ? form.productIds : undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    };
  }

  const createMutation = useMutation({
    mutationFn: () => createDiscount(buildPayload()),
    onSuccess: () => {
      showAlert("Promoción creada correctamente", "success");
      queryClient.invalidateQueries({ queryKey: ["comercio-discounts"] });
      closeModal();
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const updateMutation = useMutation({
    mutationFn: () => updateDiscount(editingDiscount!.id, buildPayload()),
    onSuccess: () => {
      showAlert("Promoción actualizada", "success");
      queryClient.invalidateQueries({ queryKey: ["comercio-discounts"] });
      closeModal();
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive ? reactivateDiscount(id) : deactivateDiscount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comercio-discounts"] });
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  function openCreateModal() {
    setEditingDiscount(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function openEditModal(discount: ComercioDiscount) {
    setEditingDiscount(discount);
    setForm({
      branchId: discount.branchId,
      name: discount.name,
      discountType: discount.discountType,
      value: String(discount.value),
      scope: discount.scope,
      categoryId: discount.categoryId ?? "",
      productIds: discount.productIds ?? [],
      startDate: discount.startDate ? discount.startDate.slice(0, 10) : "",
      endDate: discount.endDate ? discount.endDate.slice(0, 10) : "",
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingDiscount(null);
    setForm(emptyForm);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingDiscount) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  }

  function toggleProductId(productId: string) {
    setForm((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId],
    }));
  }

  const discounts = discountsQuery.data ?? [];
  const branches = branchesQuery.data ?? [];
  const branchOptions = branches.map((branch) => ({
    label: `${branch.name} (${branch.city})`,
    value: branch.id,
  }));
  const categoryOptions = (categoriesQuery.data ?? []).map((category) => ({
    label: category.name,
    value: category.id,
  }));
  const products = productsQuery.data ?? [];

  function branchName(branchId: string) {
    return branches.find((branch) => branch.id === branchId)?.name ?? "-";
  }

  const headers = ["Nombre", "Sucursal", "Valor", "Alcance", "Vigencia", "Estado", ""];
  const rows = discounts.map((discount) => [
    discount.name,
    branchName(discount.branchId),
    discount.discountType === "PERCENTAGE"
      ? `${Number(discount.value)}%`
      : `$${Number(discount.value).toLocaleString()}`,
    scopeLabel[discount.scope],
    discount.startDate || discount.endDate
      ? `${discount.startDate ? new Date(discount.startDate).toLocaleDateString() : "sin inicio"} - ${discount.endDate ? new Date(discount.endDate).toLocaleDateString() : "sin fin"}`
      : "Siempre",
    <Badge
      key={discount.id}
      colVariant={discount.isActive ? "success" : "danger"}
      size="xs"
    >
      {discount.isActive ? "Activa" : "Inactiva"}
    </Badge>,
    <div key={`actions-${discount.id}`} className="flex gap-2">
      <Button size="xs" rounded="md" onClick={() => openEditModal(discount)}>
        Editar
      </Button>
      <Button
        size="xs"
        rounded="md"
        colVariant={discount.isActive ? "warning" : "success"}
        onClick={() =>
          toggleActiveMutation.mutate({
            id: discount.id,
            isActive: !discount.isActive,
          })
        }
      >
        {discount.isActive ? "Desactivar" : "Activar"}
      </Button>
    </div>,
  ]);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/comercio/dashboard" className="text-cyan-400 text-sm">
              ← Volver al panel
            </Link>
            <Title as="h1" size="lg" colVariant="on" font="semi" className="mt-2">
              Promociones
            </Title>
          </div>
          <Button
            colVariant="success"
            rounded="md"
            onClick={openCreateModal}
            disabled={branches.length === 0}
          >
            + Agregar promoción
          </Button>
        </div>

        {branches.length === 0 && !branchesQuery.isLoading && (
          <Text size="sm" colVariant="warning" className="mb-4">
            Necesitas tener al menos una sucursal creada antes de poder
            agregar promociones.
          </Text>
        )}

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
          {discountsQuery.isLoading ? (
            <Text size="sm" className="text-slate-400 p-4">Cargando promociones...</Text>
          ) : discounts.length === 0 ? (
            <Text size="sm" className="text-slate-400 p-4">
              Aún no tienes promociones. Crea la primera.
            </Text>
          ) : (
            <Table headers={headers} rows={rows} colVariant="default" />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingDiscount ? "Editar promoción" : "Nueva promoción"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 p-2">
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

          <InputField
            placeholder="Nombre de la promoción"
            helpText="Nombre"
            sizeHelp="xs"
            inputSize="md"
            rounded="md"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <div className="flex gap-3">
            <SelectField
              options={typeOptions}
              value={form.discountType}
              onChange={(e) =>
                setForm({
                  ...form,
                  discountType: e.target.value as ComercioDiscountType,
                })
              }
              helpText="Tipo de descuento"
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
            />
            <InputField
              placeholder="Valor"
              helpText={
                form.discountType === "PERCENTAGE" ? "Valor (%)" : "Valor ($)"
              }
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
              type="number"
              min={0}
              max={form.discountType === "PERCENTAGE" ? 100 : undefined}
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              required
            />
          </div>

          <SelectField
            options={scopeOptions}
            value={form.scope}
            onChange={(e) =>
              setForm({
                ...form,
                scope: e.target.value as ComercioDiscountScope,
              })
            }
            helpText="¿A qué aplica?"
            sizeHelp="xs"
            inputSize="md"
            rounded="md"
          />

          {form.scope === "CATEGORY" && (
            <SelectField
              options={categoryOptions}
              defaultOption="Selecciona una categoría"
              value={form.categoryId}
              onChange={(e) =>
                setForm({ ...form, categoryId: e.target.value })
              }
              helpText="Categoría"
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
              required
            />
          )}

          {form.scope === "ITEM" && (
            <div>
              <label className="text-sm text-slate-400">
                Productos incluidos
              </label>
              <div className="mt-1 max-h-40 overflow-y-auto space-y-1 rounded-md border border-white/10 p-2">
                {products.length === 0 ? (
                  <Text size="xs" className="text-slate-500">
                    No tienes productos creados.
                  </Text>
                ) : (
                  products.map((product) => (
                    <label
                      key={product.id}
                      className="flex items-center gap-2 text-sm text-slate-300"
                    >
                      <input
                        type="checkbox"
                        checked={form.productIds.includes(product.id)}
                        onChange={() => toggleProductId(product.id)}
                      />
                      {product.name}
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <DateField
              label="Desde (opcional)"
              className="flex-1"
              value={form.startDate}
              onChange={(startDate) => setForm({ ...form, startDate })}
            />
            <DateField
              label="Hasta (opcional)"
              className="flex-1"
              value={form.endDate}
              onChange={(endDate) => setForm({ ...form, endDate })}
            />
          </div>

          <Button
            type="submit"
            colVariant="success"
            size="full"
            rounded="md"
            disabled={isSaving}
          >
            {isSaving
              ? "Guardando..."
              : editingDiscount
                ? "Guardar cambios"
                : "Crear promoción"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
