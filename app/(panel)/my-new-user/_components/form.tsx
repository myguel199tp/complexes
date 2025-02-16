"use client";
import React, { useState } from "react";
import {
  InputField,
  SelectField,
  Buton,
  Text,
  Title,
  Flag,
  Tooltip,
} from "complexes-next-components";
import useForm from "./use-form";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaWpforms } from "react-icons/fa";
import { FaTableList } from "react-icons/fa6";
import Tables from "./table";

export default function FormComplex() {
  const router = useRouter();
  const {
    register,
    setValue,
    formState: { errors },
    isSuccess,
    onSubmit,
  } = useForm();
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedRol, setSelectedRol] = useState("");

  const options = [
    { value: "Bogotá", label: "Bogotá" },
    { value: "Medellin", label: "Medellin" },
    { value: "Cali", label: "Cali" },
  ];

  const optionsRol = [
    { value: "useradmin", label: "Dueño de apartamento" },
    { value: "arrenadmin", label: "Arrendatario" },
    { value: "porteria", label: "Portero" },
  ];

  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState<"form" | "table">("form");

  return (
    <div className="w-full p-2 ml-8">
      {isSuccess && (
        <Flag colVariant="success" background="success" size="sm" rounded="lg">
          ¡Operación exitosa!
        </Flag>
      )}
      <Title size="md" className="m-4" font="semi" as="h2">
        Registrar Usuarios
      </Title>
      <div className="w-full flex justify-end mr-4">
        <Tooltip content="Formulario" maxWidth="14rem" position="left">
          <FaWpforms
            size={30}
            className={`cursor-pointer ${
              view === "form" ? "text-gray-500" : ""
            }`}
            onClick={() => setView("form")}
          />
        </Tooltip>
        <Tooltip content="Tabla" maxWidth="14rem" position="left">
          <FaTableList
            size={30}
            className={`cursor-pointer ${
              view === "table" ? "text-gray-500" : ""
            }`}
            onClick={() => setView("table")}
          />
        </Tooltip>
      </div>
      {view === "form" && (
        <div className="w-full flex gap-2 justify-center shadow-2xl">
          <form onSubmit={onSubmit} className="w-full">
            <div className="flex flex-col gap-4 md:!flex-row justify-between">
              <section>
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
                <SelectField
                  className="mt-2"
                  id="city"
                  defaultOption="Ciudad"
                  value={selectedCity}
                  options={options}
                  inputSize="full"
                  rounded="md"
                  hasError={!!errors.city}
                  {...register("city", {
                    onChange: (e) => setSelectedCity(e.target.value),
                  })}
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
              </section>
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700">
                  Subir imagen
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setValue("file", file, { shouldValidate: true });
                    }
                  }}
                />
                {errors.file && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.file.message}
                  </p>
                )}
              </div>
              <section>
                <InputField
                  placeholder="nombre unidad"
                  inputSize="full"
                  rounded="md"
                  className="mt-2"
                  type="text"
                  {...register("nameUnit")}
                  hasError={!!errors.nameUnit}
                  errorMessage={errors.nameUnit?.message}
                />
                <InputField
                  placeholder="Barrio o sector"
                  inputSize="full"
                  rounded="md"
                  className="mt-2"
                  type="text"
                  {...register("neigborhood")}
                  hasError={!!errors.neigborhood}
                  errorMessage={errors.neigborhood?.message}
                />
                <InputField
                  placeholder="dirección"
                  inputSize="full"
                  rounded="md"
                  className="mt-2"
                  type="text"
                  {...register("address")}
                  hasError={!!errors.address}
                  errorMessage={errors.address?.message}
                />
                <InputField
                  placeholder="pais"
                  inputSize="full"
                  rounded="md"
                  className="mt-2"
                  type="text"
                  {...register("country")}
                  hasError={!!errors.country}
                  errorMessage={errors.country?.message}
                />
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
              </section>
            </div>

            <div className="mt-1">
              <Buton
                colVariant="primary"
                size="full"
                rounded="sm"
                borderWidth="semi"
                type="submit"
              >
                <Text>Registrarse</Text>
              </Buton>
            </div>
          </form>
        </div>
      )}
      {view === "table" && (
        <div className="w-full">
          <Tables />
        </div>
      )}
    </div>
  );
}
