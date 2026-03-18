import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook, Resolver } from "react-hook-form";
import { array, boolean, mixed, object, ObjectSchema, string } from "yup";
import { RegisterRequest } from "../services/request/register";
import { useRef, useState } from "react";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  countryMap,
  phoneLengthByCountry,
} from "@/app/helpers/longitud-telefono";
import {
  useMutationForm,
  vehicless,
} from "@/app/(sets)/registers/_components/use-mutation-form";
import { USER_ROLES } from "@/app/(sets)/registers/services/request/register";

export interface Props {
  role?: string;
  apartment?: string;
  plaque?: string;
  numberId?: string;
  tower?: string;
  isMainResidence?: boolean;
  vehicles?: vehicless[];
}

export default function useForm({
  role = "owner",
  apartment,
  plaque,
  numberId,
  tower,
  isMainResidence,
  vehicles,
}: Props) {
  const idConjunto = useConjuntoStore((state) => state.conjuntoId) || "";
  const mutation = useMutationForm({
    role,
    apartment,
    plaque,
    numberId,
    idConjunto,
    tower,
    isMainResidence,
    vehicles,
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
  const schema: ObjectSchema<RegisterRequest> = object({
    name: string().required("Nombre es requerido"),
    lastName: string().required("Apellido es requerido"),
    city: string().required("Ciudad es requerida"),

    phone: string()
      .required("Teléfono es requerido")
      .matches(/^[0-9]+$/, "Solo se permiten números")
      .test(
        "len",
        "Longitud inválida para el país seleccionado",
        function (value) {
          const { indicative } = this.parent as RegisterRequest;

          if (!indicative || !value) return true;

          const countryName = indicative.split("-")[1]?.trim()?.toUpperCase();
          const countryCode = countryMap[countryName ?? ""];
          const expectedLength = phoneLengthByCountry[countryCode ?? ""];

          if (!expectedLength) return true;
          return value.length === expectedLength;
        },
      ),

    indicative: string().required("Indicativo es requerido"),
    email: string().email("Correo inválido").required("Correo es requerido"),
    termsConditions: boolean().oneOf(
      [true],
      "Debes aceptar los términos y condiciones",
    ),

    numberId: string().required("Cédula es obligatoria"),

    nameUnit: string().optional(),
    nit: string().optional(),
    address: string().optional(),
    neigborhood: string().optional(),
    country: string().optional(),
    referralCode: string().optional(),
    conjuntoId: string().optional(),
    bornDate: string().optional(),
    pet: boolean().optional(),
    council: boolean().optional(),

    file: mixed<File | null>().nullable().optional(),

    roles: array().of(string().oneOf(USER_ROLES)).optional(),

    familyInfo: array()
      .of(
        object({
          relation: string().nullable().optional(),
          nameComplet: string().nullable().optional(),
          numberId: string().nullable().optional(),
          email: string().email().nullable().optional(),
          dateBorn: string().nullable().optional(),
          photo: string().nullable().optional(),
          phones: string().nullable().optional(),
        }),
      )
      .optional(),
  });

  const methods = useFormHook<RegisterRequest>({
    mode: "all",
    resolver: yupResolver(schema) as Resolver<RegisterRequest>,
    defaultValues: {
      roles: ["owner"],
      termsConditions: true,
      conjuntoId: String(idConjunto),
    },
  });

  const { register, setValue, formState, control, watch } = methods;
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

    if (dataform.country) formData.append("country", dataform.country);

    if (dataform.file) {
      formData.append("file", dataform.file);
    }
    if (dataform.roles) {
      formData.append("roles", JSON.stringify(dataform.roles));
    }

    if (dataform.familyInfo) {
      formData.append("familyInfo", JSON.stringify(dataform.familyInfo));
    }

    if (dataform.numberId) formData.append("numberId", dataform.numberId);
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
    watch,
  };
}
