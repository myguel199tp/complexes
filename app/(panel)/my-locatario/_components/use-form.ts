import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook, Resolver } from "react-hook-form";
import { array, boolean, mixed, object, string } from "yup";
import { useRef, useState } from "react";
import {
  countryMap,
  phoneLengthByCountry,
} from "@/app/helpers/longitud-telefono";
import { RegisterSubUser } from "../services/request/registerSubUserRequest";
import { useMutationLocatario } from "./locatario-mutation";

// export interface Props {
//   role?: string;
//   apartment?: string;
//   plaque?: string;
//   numberId?: string;
//   tower?: string;
//   isMainResidence?: boolean;
//   vehicles?: vehicless[];
// }

export default function useForm() {
  //   const mutation = useMutationForm({
  //     role,
  //     apartment,
  //     plaque,
  //     numberId,
  //     tower,
  //     isMainResidence,
  //     vehicles,
  //   });
  const mutation = useMutationLocatario();
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
    country: string().required("pais es requerido"),
    city: string().required("ciudad es requerido"),
    phone: string()
      .required("Teléfono es requerido")
      .matches(/^[0-9]+$/, "Solo se permiten números")
      .test(
        "len",
        "Longitud inválida para el país seleccionado",
        function (value) {
          const { indicative } = this.parent;
          if (!indicative || !value) return true;

          // Ejemplo: "+56-Chile"
          const countryName = indicative.split("-")[1]?.trim()?.toUpperCase();
          const countryCode = countryMap[countryName];
          const expectedLength = phoneLengthByCountry[countryCode ?? ""];

          if (!expectedLength) return true;
          return value.length === expectedLength;
        }
      ),
    indicative: string().required("indicativo es requerido"),
    email: string().email("Correo inválido").required("Correo es requerido"),
    bornDate: string().required("nacimiento es es requerido"),
    pet: boolean(),
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
    familyInfo: array()
      .of(
        object({
          relation: string().nullable(),
          nameComplet: string().nullable(),
          numberId: string().nullable(),
          email: string().email().nullable(),
          dateBorn: string().nullable(),
          photo: string().nullable(),
          phones: string().nullable(),
        })
      )
      .default([]),
    numberId: string().required("Cédula es obligatoria"),
    conjuntoId: string(),
  });

  const methods = useFormHook<RegisterSubUser>({
    mode: "all",
    resolver: yupResolver(schema) as Resolver<RegisterSubUser>,
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
    formData.append("pet", String(dataform.pet));

    if (dataform.country) formData.append("country", dataform.country);

    if (dataform.file) {
      formData.append("file", dataform.file);
    }

    if (dataform.familyInfo) {
      formData.append("familyInfo", JSON.stringify(dataform.familyInfo));
    }

    if (dataform.numberId) formData.append("numberId", dataform.numberId);

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
