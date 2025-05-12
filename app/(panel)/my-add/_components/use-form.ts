import { yupResolver } from "@hookform/resolvers/yup";
import { useForm as useFormHook } from "react-hook-form";
import { mixed, object, string } from "yup";
import { useMutationAddForm } from "./use-mutation-add-form";

type FormValues = {
  iduser: string;
  name: string;
  nameUnit: string;
  profession: string;
  webPage: string;
  email: string;
  description: string;
  phone: string;
  files: File[];
  created_at: string;
  finished_at: string;
};

export default function useForm() {
  const mutation = useMutationAddForm();

  const schema = object({
    iduser: string().required("Este campo es requerido"),
    name: string().required("Este campo es requerido"),
    nameUnit: string().required("Este campo es requerido"),
    profession: string().required("Este campo es requerido"),
    webPage: string().required("Este campo es requerido"),
    email: string().email().required("Este campo es requerido"),
    description: string().required("Este campo es requerido"),
    phone: string().required("Este campo es requerido"),
    files: mixed<File[]>()
      .test("required", "Debes subir al menos una imagen", (value) => {
        return value && value.length > 0;
      })
      .test("fileSize", "Cada archivo debe ser menor a 5MB", (files) =>
        files ? files.every((file) => file.size <= 5 * 1024 * 1024) : true
      )
      .test("fileType", "Solo se permiten archivos JPEG o PNG", (files) =>
        files
          ? files.every((file) =>
              ["image/jpeg", "image/png"].includes(file.type)
            )
          : true
      ),
    created_at: string(),
    finished_at: string(),
  });

  const storedUserId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const createdAt = new Date();
  const finishedAt = new Date(createdAt);
  finishedAt.setDate(finishedAt.getDate() + 20);

  const methods = useFormHook<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues: {
      iduser: String(storedUserId),
      name: "",
      nameUnit: "san lorenzo",
      profession: "",
      webPage: "",
      email: "dolca@gmail.com",
      description: "",
      phone: "3211555555",
      files: [],
      created_at: createdAt.toISOString(),
      finished_at: finishedAt.toISOString(),
    },
  });

  const { register, handleSubmit, setValue, formState } = methods;
  const { errors } = formState;

  const onSubmit = methods.handleSubmit(async (dataform) => {
    const formData = new FormData();

    formData.append("iduser", dataform.iduser);
    formData.append("name", dataform.name);
    formData.append("nameUnit", dataform.nameUnit);
    formData.append("profession", dataform.profession);

    formData.append("webPage", dataform.webPage);
    formData.append("email", dataform.email);
    formData.append("description", dataform.description);
    formData.append("phone", dataform.phone);

    if (dataform.files?.length > 0) {
      dataform.files.forEach((file) => formData.append("files", file));
    }

    formData.append("created_at", String(dataform.created_at));
    formData.append("finished_at", dataform.finished_at);

    await mutation.mutateAsync(formData);
  });

  return {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    isSuccess: mutation.isSuccess,
    onSubmit,
  };
}
