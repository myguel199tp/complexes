import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook, Resolver } from "react-hook-form";
import { array, boolean, mixed, object, string } from "yup";
import { RegisterRequest } from "../services/request/register";
import { useRef, useState } from "react";
import { useMutationForm } from "@/app/(dashboard)/registers/_components/use-mutation-form";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

interface Props {
  role: string;
  apartment: string;
  plaque: string;
  numberid: string;
  tower: string;
  isMainResidence: boolean;
}

export default function useForm({
  role,
  apartment,
  plaque,
  numberid,
  tower,
  isMainResidence,
}: Props) {
  const idConjunto = useConjuntoStore((state) => state.conjuntoId) || "";
  const mutation = useMutationForm({
    role,
    apartment,
    plaque,
    numberid,
    idConjunto,
    tower,
    isMainResidence,
  });
  const [formsvalid, setFormsvalid] = useState({
    toogle: false,
    preview: "",
    showPassword: false,
    selectedOption: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const schema = object({
    name: string().required("Nombre es requerido"),
    lastName: string().required("Apellido es requerido"),
    city: string().required("ciudad es requerido"),
    phone: string()
      .required("Teléfono es requerido")
      .min(10, "Mínimo 10 números")
      .max(10, "Máximo 10 números"),
    indicative: string().required("indicativo es requerido"),
    email: string().email("Correo inválido").required("Correo es requerido"),
    bornDate: string().required("nacimiento es es requerido"),
    pet: boolean(),
    council: boolean(),
    termsConditions: boolean().oneOf(
      [true],
      "Debes aceptar los términos y condiciones"
    ),
    country: string().required("pais es requerido"),
    population: array()
      .of(
        object({
          nameComplet: string().optional(),
          numberId: string().optional(),
          dateBorn: string().optional(),
          relation: string().optional(),
        })
      )
      .min(1, "Debes ingresar al menos una habitación")
      .required("Debes ingresar al menos una habitación"),

    file: mixed()
      .nullable()
      .test(
        "fileSize",
        "El archivo es demasiado grande",
        (value) => !value || (value instanceof File && value.size <= 5000000)
      )
      .test(
        "fileType",
        "Tipo de archivo no soportado",
        (value) =>
          !value ||
          (value instanceof File &&
            ["image/jpeg", "image/png"].includes(value.type))
      ),
    role: string().required("Escoja el tipo de usuario"),
    numberid: string().required("Cédula es obligatoria"),
    conjuntoId: string(),
  });

  const methods = useFormHook<RegisterRequest>({
    mode: "all",
    resolver: yupResolver(schema) as Resolver<RegisterRequest>,
    defaultValues: {
      termsConditions: true,
      conjuntoId: String(idConjunto),
    },
  });

  const { register, setValue, formState, control } = methods;
  const { errors } = formState;

  const onSubmit = methods.handleSubmit(async (dataform) => {
    const formData = new FormData();

    if (dataform.name) formData.append("name", dataform.name);
    if (dataform.lastName) formData.append("lastName", dataform.lastName);
    if (dataform.city) formData.append("city", dataform.city);
    if (dataform.phone) formData.append("phone", dataform.phone);
    if (dataform.indicative) formData.append("indicative", dataform.indicative);
    if (dataform.email) formData.append("email", dataform.email);
    if (dataform.bornDate) formData.append("bornDate", dataform.bornDate);
    formData.append("termsConditions", String(dataform.termsConditions));
    formData.append("pet", String(dataform.pet));
    formData.append("council", String(dataform.council));
    formData.append("population", JSON.stringify(dataform.population)); // array serializado

    if (dataform.country) formData.append("country", dataform.country);

    if (dataform.file) {
      formData.append("file", dataform.file);
    }
    if (dataform.role) {
      formData.append("role", dataform.role);
    }

    if (dataform.numberid) formData.append("numberid", dataform.numberid);
    if (dataform.conjuntoId) formData.append("conjuntoId", dataform.conjuntoId);

    await mutation.mutateAsync(formData);
  });

  return {
    register,
    handleSubmit: onSubmit,
    setValue,
    setFormsvalid,
    control,
    formsvalid,
    formState: { errors },
    isSuccess: mutation.isSuccess,
    fileInputRef,
    handleIconClick,
  };
}
