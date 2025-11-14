"use client";
import React from "react";
import {
  InputField,
  SelectField,
  Text,
  Button,
  Tooltip,
  Buton,
} from "complexes-next-components";
import { route } from "@/app/_domain/constants/routes";
import { IoCamera, IoImages } from "react-icons/io5";
import Image from "next/image";
import "react-datepicker/dist/react-datepicker.css";
import "react-datepicker/dist/react-datepicker.css";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TbLivePhotoFilled } from "react-icons/tb";
import { GiReturnArrow } from "react-icons/gi";
import { Controller } from "react-hook-form";
import { optionsRol } from "./constants";
import { useForminfo } from "./form-info";
import { FamilyMemberForm } from "./FamilyMemberForm";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  ParkingType,
  VehicleType,
} from "@/app/(sets)/registers/_components/use-mutation-form";

export default function FormComplex() {
  const planLimits = {
    basic: 1,
    gold: 2,
    platinum: 4,
  } as const;

  type PlanType = keyof typeof planLimits; // "basic" | "gold" | "platinum"

  // Traemos plan de la store
  const planRaw = useConjuntoStore((state) => state.plan);

  // Validamos que planRaw sea uno de los valores permitidos
  const plan: PlanType = ["basic", "gold", "platinum"].includes(String(planRaw))
    ? (planRaw as PlanType)
    : "basic"; // fallback seguro

  const handleAddMember = () => {
    const maxMembers = planLimits[plan];
    if (fields.length >= maxMembers) {
      alert(`Tu plan permite máximo ${maxMembers} integrante(s).`);
      return;
    }

    append({
      nameComplet: "",
      numberId: "",
      dateBorn: "",
      relation: "",
      email: "",
      phones: "",
      indicative: "",
    });
  };
  const {
    t,
    handleFileChange,
    takePhoto,
    openCamera,
    countryOptions,
    cityOptions,
    indicativeOptions,
    setSelectedCountryId,
    fields,
    append,
    remove,
    handleSubmit,
    handleIconClick,
    fileInputRef,
    errors,
    register,
    router,
    control,
    setFormState,
    setValue,
    formState,
    videoRef,
    canvasRef,
    setTipoVehiculo,
    tipoVehiculo,
    handleAddVehicle,
    handleRemoveVehicle,
  } = useForminfo();

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col justify-center items-center w-full"
    >
      <section className="flex flex-col gap-1 md:flex-row justify-between w-full">
        {/* Columna izquierda */}

        <div className="w-full">
          <div className="mt-2 w-full">
            <Controller
              control={control}
              name="role"
              rules={{ required: t("tipoUsiarioRequerido") }}
              render={({ field }) => (
                <SelectField
                  id="role"
                  defaultOption={t("tipoUsiario")}
                  helpText={t("tipoUsiario")}
                  sizeHelp="xs"
                  inputSize="sm"
                  rounded="lg"
                  value={field.value}
                  options={optionsRol}
                  tKeyError={t("tipoUsiarioRequerido")}
                  hasError={!!errors.role}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    setFormState((prev) => ({
                      ...prev,
                      selectedRol: e.target.value,
                    }));
                  }}
                />
              )}
            />
          </div>
          <InputField
            placeholder={t("nombre")}
            helpText={t("nombre")}
            sizeHelp="xs"
            inputSize="sm"
            rounded="lg"
            className="mt-2"
            regexType="letters"
            type="text"
            {...register("name")}
            tKeyError={t("nombreRequerido")}
            hasError={!!errors.name}
            errorMessage={errors.name?.message}
          />

          <InputField
            placeholder={t("apellido")}
            helpText={t("apellido")}
            sizeHelp="xs"
            regexType="letters"
            inputSize="sm"
            rounded="lg"
            className="mt-2"
            type="text"
            {...register("lastName")}
            tKeyError={t("apellidoRequerido")}
            hasError={!!errors.lastName}
            errorMessage={errors.lastName?.message}
          />
          <div className="flex gap-2">
            <InputField
              placeholder={t("nuemroIdentificacion")}
              helpText={t("nuemroIdentificacion")}
              sizeHelp="xs"
              inputSize="sm"
              rounded="lg"
              regexType="number"
              className="mt-2"
              type="string"
              {...register("numberId", {
                onChange: (e) =>
                  setFormState((prev) => ({
                    ...prev,
                    selectedNumberId: e.target.value,
                  })),
              })}
              tKeyError={t("documentoRequerido")}
              hasError={!!errors.numberId}
              errorMessage={errors.numberId?.message}
            />
            <div className="mt-2">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={t("nacimiento")}
                  value={formState.birthDate}
                  onChange={(newDate) => {
                    setFormState((prev) => ({
                      ...prev,
                      birthDate: newDate,
                    }));

                    setFormState((prev) => ({
                      ...prev,
                      val: newDate,
                    }));

                    setValue("bornDate", String(newDate), {
                      shouldValidate: true,
                    });
                  }}
                  views={["year", "month", "day"]}
                  format="yyyy-MM-dd"
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                      error: !!errors.bornDate,
                      helperText: errors.bornDate?.message || "",
                      InputProps: {
                        sx: {
                          height: "60px",
                          backgroundColor: "#e5e7eb",
                          borderRadius: "4444px",
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </div>
          </div>
          <div className="block md:!flex items-center gap-3 mt-2">
            <SelectField
              tKeyDefaultOption={t("indicativo")}
              tKeyHelpText={t("indicativo")}
              searchable
              regexType="alphanumeric"
              defaultOption="Indicativo"
              helpText="Indicativo"
              sizeHelp="xxs"
              id="indicative"
              options={indicativeOptions}
              inputSize="sm"
              rounded="lg"
              {...register("indicative")}
              onChange={(e) => {
                setValue("indicative", e.target.value, {
                  shouldValidate: true,
                });
              }}
              tKeyError={t("idicativoRequerido")}
              hasError={!!errors.indicative}
              errorMessage={errors.indicative?.message}
            />
            <InputField
              required
              tKeyHelpText={t("celular")}
              tKeyPlaceholder={t("celular")}
              placeholder="Celular"
              helpText="Celular"
              regexType="phone"
              sizeHelp="xxs"
              inputSize="sm"
              rounded="lg"
              type="text"
              {...register("phone", {
                required: t("celularRequerido"),
                pattern: {
                  value: /^[0-9]+$/,
                  message: t("soloNumeros"),
                },
              })}
              tKeyError={t("celularRequerido")}
              hasError={!!errors.phone}
              errorMessage={errors.phone?.message}
            />
          </div>
          <InputField
            placeholder={t("correo")}
            helpText={t("correo")}
            sizeHelp="xs"
            inputSize="sm"
            rounded="lg"
            className="mt-2"
            type="email"
            {...register("email")}
            tKeyError={t("correoRequerido")}
            hasError={!!errors.email}
            errorMessage={errors.email?.message}
          />
          <div className="mt-2">
            <Text size="sm" font="semi">
              Cuenta con deposito
            </Text>
            <div className="flex gap-4 mt-2">
              <label>
                <input
                  type="radio"
                  name="deposito"
                  value="carro"
                  onChange={() =>
                    setFormState((prev) => ({ ...prev, deposito: true }))
                  }
                />
                <Text as="span" size="sm" className="ml-1">
                  Si
                </Text>
              </label>

              <label>
                <input
                  type="radio"
                  name="deposito"
                  value="moto"
                  onChange={() =>
                    setFormState((prev) => ({ ...prev, deposito: false }))
                  }
                />
                <Text as="span" size="sm" className="ml-1">
                  No
                </Text>
              </label>
            </div>
            {formState.deposito && (
              <div>
                <InputField
                  placeholder="Asignación de deposito"
                  helpText="Asignación de deposito"
                  sizeHelp="xs"
                  inputSize="sm"
                  regexType="alphanumeric"
                  rounded="lg"
                  className="mt-2"
                  type="text"
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      selectedPlaque: e.target.value,
                    }))
                  }
                />
              </div>
            )}
          </div>
          {formState.selectedRol === "owner" && (
            <>
              {" "}
              <div className="flex mt-2 mb-4 md:!mb-0 border rounded-full p-4">
                <div className="flex items-center justify-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("pet")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-800 rounded-full peer dark:bg-gray-300 peer-checked:bg-cyan-800 transition-colors"></div>
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full border border-gray-300 transition-transform peer-checked:translate-x-full"></div>
                  </label>
                  <Text size="sm" translate="yes">
                    Tiene mascota
                  </Text>
                </div>
              </div>
              <div className="flex mt-2 mb-4 md:!mb-0 border rounded-full p-4">
                <div className="flex items-center justify-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.selectedMainResidence}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          selectedMainResidence: e.target.checked,
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-800 rounded-full peer dark:bg-gray-300 peer-checked:bg-cyan-800 transition-colors"></div>
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full border border-gray-300 transition-transform peer-checked:translate-x-full"></div>
                  </label>
                  <Text size="sm" translate="yes">
                    Recide en la propiedad
                  </Text>
                </div>
              </div>
              <div className="flex mt-2 mb-4 md:!mb-0 border rounded-full p-4">
                <div className="flex items-center justify-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("council")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-800 rounded-full peer dark:bg-gray-300 peer-checked:bg-cyan-800 transition-colors"></div>
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full border border-gray-300 transition-transform peer-checked:translate-x-full"></div>
                  </label>
                  <Text size="sm" translate="yes">
                    Pertenece al consejo administrativo
                  </Text>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Columna imagen */}
        <div className="w-full border-x-4  p-2 flex flex-col items-center">
          {!formState.preview && !formState.isCameraOpen && (
            <div className="flex flex-col items-center gap-2">
              <IoImages
                onClick={handleIconClick}
                className="cursor-pointer text-gray-200 w-24 h-24 sm:w-48 sm:h-48 md:w-60  md:h-60"
              />
              <Button
                size="sm"
                rounded="lg"
                type="button"
                colVariant="warning"
                className="flex gap-4 items-center"
                onClick={openCamera}
              >
                <IoCamera className="mr-1" size={20} />
                <Text size="sm" tKey={t("tomarFoto")} translate="yes">
                  Tomar foto
                </Text>
              </Button>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />

          {formState.isCameraOpen && (
            <div className="flex flex-col items-center">
              <video
                ref={videoRef}
                className="w-full max-w-3xl border rounded-md aspect-video"
              />
              <div className="flex gap-16">
                <Tooltip
                  content="Tomar foto"
                  tKey={t("tomarFoto")}
                  position="bottom"
                  className="bg-gray-200 w-32"
                >
                  <TbLivePhotoFilled
                    onClick={takePhoto}
                    className="mt-4 cursor-pointer text-cyan-800 hover:text-gray-200"
                    size={45}
                  />
                </Tooltip>

                <Tooltip
                  content="Cancelar"
                  tKey={t("cancelar")}
                  position="bottom"
                  className="bg-gray-200 w-32"
                >
                  <GiReturnArrow
                    onClick={() =>
                      setFormState((prev) => ({ ...prev, isCameraOpen: false }))
                    }
                    className="mt-4 cursor-pointer text-red-800 hover:text-gray-200"
                    size={35}
                  />
                </Tooltip>
              </div>
              <canvas
                ref={canvasRef}
                width={300}
                height={200}
                className="hidden"
              />
            </div>
          )}

          {formState.preview && (
            <div className="mt-3 gap-5">
              <Image
                src={formState.preview}
                width={900}
                height={600}
                alt="Vista previa"
                className="rounded-md border"
              />
              <Button
                size="sm"
                type="button"
                className="mt-2"
                colVariant="primary"
                onClick={openCamera}
              >
                Tomar otra
              </Button>
              <Button
                size="sm"
                type="button"
                colVariant="primary"
                onClick={() => fileInputRef.current?.click()}
              >
                Cambiar imagen
              </Button>
            </div>
          )}
        </div>

        <div className="w-full ">
          <div className="mt-2">
            <SelectField
              defaultOption="Pais"
              helpText="Pais"
              sizeHelp="xs"
              id="country"
              regexType="alphanumeric"
              options={countryOptions}
              inputSize="sm"
              rounded="lg"
              {...register("country")}
              onChange={(e) => {
                setSelectedCountryId(e.target.value || null);
                setValue("country", e.target.value, {
                  shouldValidate: true,
                });
              }}
              hasError={!!errors.country}
              errorMessage={errors.country?.message}
            />
          </div>
          <div className="mt-2">
            <SelectField
              defaultOption="Ciudad"
              helpText="Ciudad"
              sizeHelp="xs"
              regexType="alphanumeric"
              id="city"
              options={cityOptions}
              inputSize="sm"
              rounded="lg"
              {...register("city")}
              onChange={(e) => {
                setValue("city", e.target?.value || "", {
                  shouldValidate: true,
                });
              }}
              hasError={!!errors.city}
              errorMessage={errors.city?.message}
            />
          </div>
          {formState.selectedRol === "owner" && (
            <>
              <InputField
                placeholder={t("torre")}
                helpText={t("torre")}
                required={true}
                sizeHelp="xs"
                regexType="alphanumeric"
                inputSize="sm"
                rounded="lg"
                className="mt-2"
                type="text"
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    selectedBlock: e.target.value,
                  }))
                }
              />
              <InputField
                placeholder={t("numeroInmuebleResidencial")}
                helpText={t("numeroInmuebleResidencial")}
                required={true}
                sizeHelp="xs"
                regexType="alphanumeric"
                inputSize="sm"
                rounded="lg"
                className="mt-2"
                type="text"
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    selectedApartment: e.target.value,
                  }))
                }
              />
            </>
          )}

          <Button
            type="button"
            colVariant="primary"
            className="mt-2"
            size="sm"
            onClick={handleAddVehicle}
          >
            Añadir vehículo
          </Button>

          {tipoVehiculo.map((veh, index) => (
            <div
              key={index}
              className="max-w-md p-4 bg-white shadow rounded space-y-4 mt-2"
            >
              <Text size="sm" font="semi">
                Tipo de vehículo
              </Text>

              <div className="flex gap-4 mt-2">
                <label>
                  <input
                    type="radio"
                    checked={veh.type === VehicleType.CAR}
                    onChange={() => {
                      const updated = [...tipoVehiculo];
                      updated[index].type = VehicleType.CAR;
                      setTipoVehiculo(updated);
                    }}
                  />
                  <Text as="span" size="sm" className="ml-1">
                    Carro
                  </Text>
                </label>

                <label>
                  <input
                    type="radio"
                    checked={veh.type === VehicleType.MOTORCYCLE}
                    onChange={() => {
                      const updated = [...tipoVehiculo];
                      updated[index].type = VehicleType.MOTORCYCLE;
                      setTipoVehiculo(updated);
                    }}
                  />
                  <Text as="span" size="sm" className="ml-1">
                    Moto
                  </Text>
                </label>
              </div>

              <Text size="sm" font="semi">
                Tipo de parqueadero
              </Text>

              <div className="flex gap-4 mt-2">
                <label>
                  <input
                    type="radio"
                    checked={veh.parkingType === ParkingType.PUBLIC}
                    onChange={() => {
                      const updated = [...tipoVehiculo];
                      updated[index].parkingType = ParkingType.PUBLIC;
                      setTipoVehiculo(updated);
                    }}
                  />
                  <Text as="span" size="sm" className="ml-1">
                    Público
                  </Text>
                </label>

                <label>
                  <input
                    type="radio"
                    checked={veh.parkingType === ParkingType.PRIVATE}
                    onChange={() => {
                      const updated = [...tipoVehiculo];
                      updated[index].parkingType = ParkingType.PRIVATE;
                      setTipoVehiculo(updated);
                    }}
                  />
                  <Text as="span" size="sm" className="ml-1">
                    Privado
                  </Text>
                </label>
              </div>

              <InputField
                regexType="alphanumeric"
                placeholder="Número de asignación"
                value={veh.assignmentNumber}
                onChange={(e) => {
                  const updated = [...tipoVehiculo];
                  updated[index].assignmentNumber = e.target.value;
                  setTipoVehiculo(updated);
                }}
              />

              <InputField
                placeholder="Placa"
                regexType="alphanumeric"
                value={veh.plaque}
                onChange={(e) => {
                  const updated = [...tipoVehiculo];
                  updated[index].plaque = e.target.value;
                  setTipoVehiculo(updated);
                }}
              />

              <Button
                type="button"
                colVariant="danger"
                size="sm"
                onClick={() => handleRemoveVehicle(index)}
              >
                Eliminar vehículo
              </Button>
            </div>
          ))}
          <div className="flex items-center mt-3 gap-2">
            <input type="checkbox" {...register("termsConditions")} />
            <Buton
              type="button"
              borderWidth="none"
              onClick={() => {
                router.push(route.termsConditions);
              }}
              className="text-sm text-cyan-600 underline"
            >
              Términos y condiciones aceptados
            </Buton>
          </div>
          {errors.termsConditions && (
            <Text colVariant="danger" size="xs">
              {errors.termsConditions.message}
            </Text>
          )}
        </div>
      </section>

      {formState.selectedRol === "owner" && (
        <div className="mt-4 border p-2 rounded-md w-full bg-gray-100">
          <Text size="sm" font="bold" className="mt-2" translate="yes">
            Integrantes del hogar
          </Text>
          {fields.map((field, index) => (
            <FamilyMemberForm
              key={field.id}
              control={control}
              register={register}
              index={index}
              remove={remove}
              errors={errors}
            />
          ))}

          <Button
            type="button"
            size="sm"
            colVariant="primary"
            onClick={handleAddMember}
          >
            Añadir
          </Button>
        </div>
      )}

      <Button
        type="submit"
        tKey={t("agregarUsuario")}
        translate="yes"
        disabled={formState.selectedApartment === ""}
        colVariant="warning"
        size="full"
        className="mt-4"
      >
        Agregar usuario
      </Button>
    </form>
  );
}
