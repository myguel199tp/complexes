"use client";
import React, { useRef, useState } from "react";
import {
  InputField,
  SelectField,
  Buton,
  Text,
  Flag,
  Button,
} from "complexes-next-components";
import useForm from "./use-form";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { IoImages } from "react-icons/io5";
import Image from "next/image";

export default function FormComplex() {
  const router = useRouter();
  const {
    register,
    setValue,
    formState: { errors },
    isSuccess,
    onSubmit,
  } = useForm();
  const [selectedRol, setSelectedRol] = useState("");

  const optionsRol = [
    { value: "useradmin", label: "Dueño de apartamento" },
    { value: "arrenadmin", label: "Arrendatario" },
    { value: "porteria", label: "Portero" },
  ];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("file", file, { shouldValidate: true });
      const fileUrl = URL.createObjectURL(file);
      setPreview(fileUrl);
    } else {
      setPreview(null);
    }
  };

  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  return (
    <div className="w-full p-2">
      {isSuccess && (
        <Flag colVariant="success" background="success" size="sm" rounded="lg">
          ¡Operación exitosa!
        </Flag>
      )}
      <div className="w-full flex gap-2 justify-center shadow-2xl">
        <form
          onSubmit={onSubmit}
          className="flex flex-col justify-center items-center w-full p-4"
        >
          <section className="flex flex-col gap-4 md:!flex-row justify-between w-full">
            <div className="w-full md:!w-[45%]">
              <InputField
                placeholder="nombre"
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="text"
                {...register("name")}
                hasError={!!errors.name}
                errorMessage={errors.name?.message}
              />
              <InputField
                placeholder="apellido"
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="text"
                {...register("lastName")}
                hasError={!!errors.lastName}
                errorMessage={errors.lastName?.message}
              />
              <InputField
                placeholder="Celular"
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="text"
                {...register("phone")}
                hasError={!!errors.phone}
                errorMessage={errors.phone?.message}
              />
              <InputField
                placeholder="correo electronico"
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="email"
                {...register("email")}
                hasError={!!errors.email}
                errorMessage={errors.email?.message}
              />
              <div className="relative mt-2">
                <InputField
                  placeholder="contraseña"
                  inputSize="full"
                  rounded="md"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  hasError={!!errors.password}
                  errorMessage={errors.password?.message}
                />
                <div
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible size={20} />
                  ) : (
                    <AiOutlineEye size={20} />
                  )}
                </div>
              </div>
              <InputField
                placeholder="numero de cedula"
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="text"
                {...register("numberid")}
                hasError={!!errors.numberid}
                errorMessage={errors.numberid?.message}
              />
            </div>
            <div className="w-full md:!w-[30%] border-x-4 border-cyan-800 p-2">
              {!preview && (
                <>
                  <IoImages
                    size={150}
                    onClick={handleIconClick}
                    className="cursor-pointer text-cyan-800 "
                  />
                  <div className="flex justify-center items-center">
                    <Text size="sm"> solo archivos png - jpg </Text>
                  </div>
                </>
              )}

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
              {preview && (
                <div className="mt-3">
                  <Image
                    src={preview}
                    width={300}
                    height={130}
                    alt="Vista previa"
                    className="w-full max-w-xs rounded-md border"
                  />
                  <Button
                    className="p-2"
                    colVariant="primary"
                    size="sm"
                    onClick={handleIconClick}
                  >
                    Cargar otra
                  </Button>
                </div>
              )}
              {errors.file && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.file.message}
                </p>
              )}
            </div>
            <div className="w-full md:!w-[45%]">
              {/* dentro de tu <form> */}
              <input type="hidden" {...register("address")} />
              <input type="hidden" {...register("neigborhood")} />
              <input type="hidden" {...register("city")} />
              <input type="hidden" {...register("country")} />
              <input type="hidden" {...register("nameUnit")} />
              <input type="hidden" {...register("nit")} />
              <InputField
                placeholder="Número vivenda"
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="text"
                {...register("apartment")}
                hasError={!!errors.apartment}
                errorMessage={errors.address?.message}
              />
              <SelectField
                className="mt-2"
                id="rol"
                defaultOption="Tipo de usuario"
                value={selectedRol}
                options={optionsRol}
                inputSize="full"
                rounded="md"
                hasError={!!errors.rol}
                {...register("rol", {
                  onChange: (e) => setSelectedRol(e.target.value),
                })}
              />
              <InputField
                placeholder="placa"
                inputSize="full"
                rounded="md"
                className="mt-2"
                type="text"
                {...register("plaque")}
                hasError={!!errors.plaque}
                errorMessage={errors.plaque?.message}
              />
              <div className="flex items-center mt-3 gap-2">
                <input type="checkbox" {...register("termsConditions")} />
                <button
                  onClick={() => {
                    router.push(route.termsConditions);
                  }}
                >
                  términos y condiciones
                </button>
              </div>
              {errors.termsConditions && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.termsConditions.message}
                </p>
              )}
            </div>
          </section>

          <Buton
            colVariant="primary"
            size="full"
            rounded="md"
            borderWidth="semi"
            type="submit"
            className="mt-4"
            disabled={isSuccess}
          >
            <Text>Registrarse aqui</Text>
          </Buton>
        </form>
      </div>
    </div>
  );
}
