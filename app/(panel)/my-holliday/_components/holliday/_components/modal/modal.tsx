"use client";

import {
  InputField,
  Modal,
  SelectField,
  Text,
  Button,
} from "complexes-next-components";
import React from "react";
import useFormHollidayPay from "./use-pay-form";
import { useCountryOptions } from "./useCountryOptions";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalPayHoliday({ isOpen, onClose }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    errors,
    otpSent,
    isSendingOtp,
  } = useFormHollidayPay();

  const country = watch("country");
  const method = watch("paymentMethod");
  const { countryOptions } = useCountryOptions();

  // 🔹 Renderizado dinámico según el país seleccionado
  const renderCountryFields = () => {
    switch (country) {
      case "US":
      case "CA":
        return (
          <>
            <InputField
              helpText="Número de cuenta"
              sizeHelp="xs"
              inputSize="sm"
              rounded="lg"
              placeholder="Número de cuenta"
              {...register("accountNumber")}
              errorMessage={errors.accountNumber?.message}
            />
            <InputField
              helpText="Routing / Transit Number"
              sizeHelp="xs"
              inputSize="sm"
              rounded="lg"
              placeholder="Routing / Transit Number"
              {...register("routingNumber")}
              errorMessage={errors.routingNumber?.message}
            />
          </>
        );
      case "MX":
        return (
          <InputField
            helpText="CLABE (18 dígitos)"
            sizeHelp="xs"
            inputSize="sm"
            rounded="lg"
            placeholder="CLABE (18 dígitos)"
            {...register("clabe")}
            errorMessage={errors.clabe?.message}
          />
        );
      case "CO":
        return (
          <>
            <SelectField
              helpText="Tipo de cuenta"
              sizeHelp="xs"
              inputSize="sm"
              rounded="lg"
              defaultOption="Tipo de cuenta"
              options={[
                { label: "Ahorros", value: "SAVINGS" },
                { label: "Corriente", value: "CHECKING" },
              ]}
              value={watch("accountType")}
              onChange={(e) =>
                setValue(
                  "accountType",
                  e.target.value as "SAVINGS" | "CHECKING"
                )
              }
            />
            <InputField
              helpText="Banco"
              sizeHelp="xs"
              inputSize="sm"
              rounded="lg"
              placeholder="Banco"
              {...register("bankName")}
              errorMessage={errors.bankName?.message}
            />
            <InputField
              helpText="Número de cuenta o teléfono"
              sizeHelp="xs"
              inputSize="sm"
              rounded="lg"
              placeholder="Número de cuenta o teléfono"
              {...register("accountNumber")}
              errorMessage={errors.accountNumber?.message}
            />
          </>
        );
      default:
        return (
          <InputField
            sizeHelp="xs"
            inputSize="sm"
            rounded="lg"
            helpText="Número o identificación bancaria"
            placeholder="Número o identificación bancaria"
            {...register("accountNumber")}
            errorMessage={errors.accountNumber?.message}
          />
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Datos de pago"
      closeOnOverlayClick={false}
      className="w-[800px] h-auto"
    >
      {/* 👇 handleSubmit ya contiene toda la lógica OTP + registro */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Text size="sm">
            Por favor, ingresa los datos donde deseas recibir el pago. Ten en
            cuenta que el pago se realizará una vez que el huésped haya ocupado
            el inmueble.
          </Text>

          <Text size="sm" font="bold">
            Los costos asociados a la transacción se descontarán del monto
            total.
          </Text>

          <InputField
            helpText="Nombre completo del titular"
            sizeHelp="xs"
            inputSize="sm"
            rounded="lg"
            placeholder="Nombre completo del titular"
            {...register("fullName")}
            errorMessage={errors.fullName?.message}
          />

          <InputField
            helpText="Correo electrónico"
            sizeHelp="xs"
            inputSize="sm"
            rounded="lg"
            placeholder="Correo electrónico"
            {...register("email")}
            errorMessage={errors.email?.message}
          />

          <SelectField
            helpText="Método de pago"
            sizeHelp="xs"
            inputSize="sm"
            rounded="lg"
            defaultOption="Método de pago"
            options={[
              { label: "Transferencia bancaria", value: "BANK_TRANSFER" },
              { label: "PayPal", value: "PAYPAL" },
              { label: "Efectivo", value: "CASH" },
            ]}
            value={method}
            onChange={(e) =>
              setValue(
                "paymentMethod",
                e.target.value as "BANK_TRANSFER" | "PAYPAL" | "CASH"
              )
            }
          />

          {method === "BANK_TRANSFER" && (
            <>
              <SelectField
                helpText="País del banco"
                sizeHelp="xs"
                inputSize="sm"
                rounded="lg"
                defaultOption="País del banco"
                options={countryOptions}
                value={country}
                onChange={(e) => setValue("country", e.target.value)}
              />
              {country && (
                <div className="mt-2 border-t pt-3 space-y-2">
                  {renderCountryFields()}
                </div>
              )}
            </>
          )}

          {method === "PAYPAL" && (
            <InputField
              helpText="Correo asociado a tu cuenta PayPal"
              sizeHelp="xs"
              inputSize="sm"
              rounded="lg"
              placeholder="Correo asociado a tu cuenta PayPal"
              {...register("email")}
              errorMessage={errors.email?.message}
            />
          )}

          {/* ✅ Solo mostrar OTP cuando ya fue enviado */}
          {otpSent && (
            <InputField
              helpText="Código OTP (revisa tu correo)"
              sizeHelp="xs"
              inputSize="sm"
              rounded="lg"
              placeholder="Código de verificación"
              {...register("otp")}
              errorMessage={errors.otp?.message}
            />
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Button
              size="sm"
              colVariant="danger"
              type="button"
              onClick={onClose}
            >
              Cancelar
            </Button>

            <Button
              size="sm"
              type="submit"
              colVariant="warning"
              disabled={isSendingOtp}
            >
              {isSendingOtp
                ? "Enviando código..."
                : otpSent
                ? "Confirmar y registrar pago"
                : "Enviar código OTP"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
