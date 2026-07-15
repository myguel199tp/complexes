"use client";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm as useFormHook, Resolver } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { InferType, mixed, object, string } from "yup";
import { registerComercio } from "./services/comercioRegisterService";
import { useAlertStore } from "@/app/components/store/useAlertStore";

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
  phone: string().required("El teléfono es requerido"),
  indicative: string().optional(),
  taxId: string().optional(),
  address: string().optional(),
  city: string().optional(),
  country: string().optional(),
  description: string().optional(),
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
  const showAlert = useAlertStore((state) => state.showAlert);

  const [preview, setPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const methods = useFormHook<RegisterFormValues>({
    mode: "all",
    resolver: yupResolver(schema) as Resolver<RegisterFormValues>,
    defaultValues: { businessModel: "b2c" },
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
