"use client";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { useForm as useFormHook, Resolver } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import {
  InferType,
  array,
  boolean,
  mixed,
  number,
  object,
  ref,
  string,
} from "yup";
import { registerComercio } from "./services/comercioRegisterService";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  B2B_SERVICE_CATEGORIES,
  B2bServiceCategory,
} from "@/app/helpers/b2bServiceCategories";

const CATEGORY_VALUES = B2B_SERVICE_CATEGORIES.map((c) => c.value);

const schema = object({
  businessModel: mixed<"b2c" | "b2b">()
    .oneOf(["b2c", "b2b"], "Selecciona el tipo de comercio")
    .required("El tipo de comercio es requerido"),
  businessName: string().required("El nombre del negocio es requerido"),
  ownerName: string().required("El nombre del propietario es requerido"),
  email: string().email("Correo inválido").required("El correo es requerido"),
  password: string()
    .min(6, "Mínimo 6 caracteres")
    .required("La contraseña es requerida"),
  // Solo se valida en el cliente: una cuenta de comercio no tiene recuperación
  // inmediata, así que un error de tipeo al registrarse deja al dueño afuera.
  confirmPassword: string()
    .oneOf([ref("password")], "Las contraseñas no coinciden")
    .required("Confirma la contraseña"),
  phone: string().required("El teléfono es requerido"),
  indicative: string().optional(),
  // Un comercio B2B factura contratos a copropiedades y el conjunto necesita el
  // NIT para contabilizarlos; un B2C puede ser un vendedor sin empresa.
  taxId: string().when("businessModel", {
    is: "b2b",
    then: (s) => s.required("El NIT es obligatorio para un comercio B2B"),
    otherwise: (s) => s.optional(),
  }),
  address: string().optional(),
  city: string().optional(),
  country: string().optional(),
  description: string().optional(),

  /**
   * Sin al menos un servicio, un proveedor B2B no aparece en ninguna búsqueda
   * del conjunto ni recibe ninguna convocatoria de demanda agregada: quedaría
   * registrado pero invisible.
   */
  serviceCategories: array()
    .of(mixed<B2bServiceCategory>().oneOf(CATEGORY_VALUES).required())
    .when("businessModel", {
      is: "b2b",
      then: (s) => s.min(1, "Selecciona al menos un servicio que prestas"),
      otherwise: (s) => s.strip(),
    })
    .default([]),

  /** Vacío se lee como cobertura nacional. */
  coverageCities: array().of(string().required()).default([]),

  website: string()
    .url("Debe ser una URL válida (incluye https://)")
    .optional(),

  yearsExperience: number()
    .transform((value, original) => (original === "" ? undefined : value))
    .typeError("Debe ser un número")
    .integer("Debe ser un número entero")
    .min(0, "No puede ser negativo")
    .max(150, "Revisa el valor")
    .optional(),

  termsAccepted: boolean()
    .oneOf([true], "Debes aceptar los términos y condiciones")
    .required("Debes aceptar los términos y condiciones"),
  logo: mixed<File>()
    .required("La imagen del comercio es requerida")
    .test(
      "fileSize",
      "El archivo es demasiado grande (máx. 5MB)",
      (value) => value instanceof File && value.size <= 5_000_000,
    )
    .test(
      "fileType",
      "Tipo de archivo no soportado (solo JPG o PNG)",
      (value) =>
        value instanceof File &&
        ["image/jpeg", "image/png"].includes(value.type),
    ),
});

type RegisterFormValues = InferType<typeof schema>;

export default function useForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showAlert = useAlertStore((state) => state.showAlert);

  /**
   * La landing de comercios ofrece un botón por modelo, así que llega con el
   * query `?model=b2b`. Se respeta como valor inicial —el usuario aún puede
   * cambiarlo en las tarjetas— y cualquier otro valor cae en el B2C de siempre.
   */
  const initialModel = searchParams.get("model") === "b2b" ? "b2b" : "b2c";

  const [preview, setPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const methods = useFormHook<RegisterFormValues>({
    mode: "all",
    resolver: yupResolver(schema) as Resolver<RegisterFormValues>,
    defaultValues: {
      businessModel: initialModel,
      termsAccepted: false,
      serviceCategories: [],
      coverageCities: [],
    },
  });

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    methods.setValue("logo", file, { shouldValidate: true });
    setPreview(URL.createObjectURL(file));
  };

  const mutation = useMutation({
    mutationFn: registerComercio,
  });

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      const formData = new FormData();
      formData.append("businessModel", data.businessModel);
      formData.append("businessName", data.businessName);
      formData.append("ownerName", data.ownerName);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("phone", data.phone);
      if (data.indicative) formData.append("indicative", data.indicative);
      if (data.taxId) formData.append("taxId", data.taxId);
      if (data.address) formData.append("address", data.address);
      if (data.city) formData.append("city", data.city);
      if (data.country) formData.append("country", data.country);
      if (data.description) formData.append("description", data.description);
      if (data.website) formData.append("website", data.website);
      if (data.yearsExperience !== undefined && data.yearsExperience !== null) {
        formData.append("yearsExperience", String(data.yearsExperience));
      }

      // Los arreglos van como JSON: un multipart no los tiene, y el DTO los
      // parsea con el mismo criterio. Solo se mandan para b2b porque el
      // backend igual los descarta para b2c y `forbidNonWhitelisted` no
      // perdona un campo de más.
      if (data.businessModel === "b2b") {
        formData.append(
          "serviceCategories",
          JSON.stringify(data.serviceCategories ?? []),
        );
        formData.append(
          "coverageCities",
          JSON.stringify(data.coverageCities ?? []),
        );
      }

      // La confirmación de contraseña se queda en el cliente a propósito: no es
      // un dato del comercio, es una comprobación de tipeo.
      formData.append("termsAccepted", String(data.termsAccepted));

      if (data.logo instanceof File) formData.append("logo", data.logo);

      await mutation.mutateAsync(formData);

      showAlert("¡Comercio registrado exitosamente!", "success");
      router.push("/comercio/login");
    } catch (error) {
      showAlert(error.message, "error");
    }
  });

  return {
    ...methods,
    onSubmit,
    isSubmitting: mutation.isLoading,
    preview,
    fileInputRef,
    handleIconClick,
    handleFileChange,
  };
}
