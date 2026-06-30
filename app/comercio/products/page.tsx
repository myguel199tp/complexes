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
  TextAreaField,
  Title,
} from "complexes-next-components";
import { getComercioToken } from "../_lib/comercio-auth";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  ComercioProduct,
  createCategory,
  createProduct,
  deleteProduct,
  getCategories,
  getProducts,
  setProductAvailability,
  updateProduct,
} from "./services/comercioProductService";
import { getBranches } from "../branches/services/comercioBranchService";
import Link from "next/link";

const emptyForm = {
  branchId: "",
  name: "",
  description: "",
  price: "",
  stock: "",
  categoryId: "",
};

export default function ComercioProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ComercioProduct | null>(
    null,
  );
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<File[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    if (!getComercioToken()) {
      router.push("/comercio/login");
    }
  }, [router]);

  const productsQuery = useQuery({
    queryKey: ["comercio-products"],
    queryFn: getProducts,
  });

  const categoriesQuery = useQuery({
    queryKey: ["comercio-categories"],
    queryFn: getCategories,
  });

  const branchesQuery = useQuery({
    queryKey: ["comercio-branches"],
    queryFn: getBranches,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createProduct(
        {
          branchId: form.branchId,
          name: form.name,
          description: form.description,
          price: Number(form.price),
          stock: form.stock ? Number(form.stock) : undefined,
          categoryId: form.categoryId || undefined,
        },
        images,
      ),
    onSuccess: () => {
      showAlert("Producto creado correctamente", "success");
      queryClient.invalidateQueries({ queryKey: ["comercio-products"] });
      closeModal();
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateProduct(editingProduct!.id, {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: form.stock ? Number(form.stock) : undefined,
        categoryId: form.categoryId || undefined,
      }),
    onSuccess: () => {
      showAlert("Producto actualizado", "success");
      queryClient.invalidateQueries({ queryKey: ["comercio-products"] });
      closeModal();
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const availabilityMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      setProductAvailability(id, isAvailable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comercio-products"] });
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      showAlert("Producto eliminado", "success");
      queryClient.invalidateQueries({ queryKey: ["comercio-products"] });
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => createCategory(name),
    onSuccess: (category) => {
      queryClient.invalidateQueries({ queryKey: ["comercio-categories"] });
      setForm((prev) => ({ ...prev, categoryId: category.id }));
      setNewCategoryName("");
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  function openCreateModal() {
    setEditingProduct(null);
    setForm(emptyForm);
    setImages([]);
    setIsModalOpen(true);
  }

  function openEditModal(product: ComercioProduct) {
    setEditingProduct(product);
    setForm({
      branchId: product.branchId,
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: product.stock !== undefined ? String(product.stock) : "",
      categoryId: product.categoryId ?? "",
    });
    setImages([]);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingProduct(null);
    setForm(emptyForm);
    setImages([]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingProduct) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  }

  const products = productsQuery.data ?? [];

  const headers = ["Nombre", "Precio", "Stock", "Categoría", "Estado", ""];
  const rows = products.map((product) => [
    product.name,
    `$${Number(product.price).toLocaleString()}`,
    product.stock ?? "-",
    product.category?.name ?? "-",
    <Badge
      key={product.id}
      colVariant={product.isAvailable ? "success" : "danger"}
      size="xs"
    >
      {product.isAvailable ? "Disponible" : "No disponible"}
    </Badge>,
    <div key={`actions-${product.id}`} className="flex gap-2">
      <Button size="xs" rounded="md" onClick={() => openEditModal(product)}>
        Editar
      </Button>
      <Button
        size="xs"
        rounded="md"
        colVariant={product.isAvailable ? "warning" : "success"}
        onClick={() =>
          availabilityMutation.mutate({
            id: product.id,
            isAvailable: !product.isAvailable,
          })
        }
      >
        {product.isAvailable ? "Desactivar" : "Activar"}
      </Button>
      <Button
        size="xs"
        rounded="md"
        colVariant="danger"
        onClick={() => {
          if (confirm(`¿Eliminar "${product.name}"?`)) {
            deleteMutation.mutate(product.id);
          }
        }}
      >
        Eliminar
      </Button>
    </div>,
  ]);

  const categoryOptions = (categoriesQuery.data ?? []).map((category) => ({
    label: category.name,
    value: category.id,
  }));

  const branches = branchesQuery.data ?? [];
  const branchOptions = branches.map((branch) => ({
    label: branch.name,
    value: branch.id,
  }));

  const isSaving = createMutation.isPending || updateMutation.isPending;

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
              Mis productos
            </Title>
          </div>
          <Button colVariant="success" rounded="md" onClick={openCreateModal}>
            + Agregar producto
          </Button>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl overflow-x-auto">
          {productsQuery.isLoading ? (
            <p className="text-slate-400 p-4">Cargando productos...</p>
          ) : products.length === 0 ? (
            <p className="text-slate-400 p-4">
              Aún no tienes productos. Crea el primero.
            </p>
          ) : (
            <Table headers={headers} rows={rows} colVariant="default" />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? "Editar producto" : "Nuevo producto"}
        className="w-[920px]"
      >
        <form onSubmit={handleSubmit} className="space-y-4 p-2">
          {branches.length === 0 ? (
            <p className="text-amber-400 text-sm">
              Aún no tienes sucursales.{" "}
              <Link href="/comercio/branches" className="underline">
                Crea una sucursal
              </Link>{" "}
              antes de registrar productos.
            </p>
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
            placeholder="Nombre del producto"
            helpText="Nombre"
            sizeHelp="xs"
            inputSize="md"
            rounded="md"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <TextAreaField
            placeholder="Descripción"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-md border bg-gray-200 px-3 py-2 text-sm"
            required
          />

          <div className="flex gap-3">
            <InputField
              placeholder="Precio"
              helpText="Precio"
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
            <InputField
              placeholder="Stock"
              helpText="Stock (opcional)"
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>

          <SelectField
            options={categoryOptions}
            defaultOption="Sin categoría"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            helpText="Categoría (opcional)"
            sizeHelp="xs"
            inputSize="md"
            rounded="md"
          />

          <div className="flex gap-2">
            <InputField
              placeholder="Nueva categoría"
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <Button
              type="button"
              size="sm"
              rounded="md"
              disabled={!newCategoryName.trim()}
              onClick={() =>
                createCategoryMutation.mutate(newCategoryName.trim())
              }
            >
              + Crear
            </Button>
          </div>

          {!editingProduct && (
            <div>
              <label className="text-sm text-slate-400">
                Imágenes (opcional, máx. 5)
              </label>
              <input
                type="file"
                accept="image/png, image/jpeg"
                multiple
                onChange={(e) =>
                  setImages(Array.from(e.target.files ?? []).slice(0, 5))
                }
                className="block mt-1 text-slate-300"
              />
            </div>
          )}

          <Button
            type="submit"
            colVariant="success"
            size="full"
            rounded="md"
            disabled={isSaving || branches.length === 0}
          >
            {isSaving
              ? "Guardando..."
              : editingProduct
                ? "Guardar cambios"
                : "Crear producto"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
