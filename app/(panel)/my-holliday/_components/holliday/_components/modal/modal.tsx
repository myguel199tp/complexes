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
import { BANKS_BY_COUNTRY } from "./banks";

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

  const renderCountryFields = () => {
    switch (country) {
      case "US":
      case "CA":
        return (
          <>
            <SelectField
              helpText="Banco"
              sizeHelp="xs"
              inputSize="md"
              rounded="lg"
              defaultOption="Selecciona un banco"
              options={BANKS_BY_COUNTRY[country]}
              value={watch("bankName")}
              onChange={(e) => setValue("bankName", e.target.value)}
            />

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
              placeholder="Routing o Transit Number"
              {...register("routingNumber")}
              errorMessage={errors.routingNumber?.message}
            />
          </>
        );

      case "MX":
        return (
          <>
            <SelectField
              helpText="Banco"
              sizeHelp="xs"
              inputSize="md"
              rounded="lg"
              defaultOption="Selecciona un banco"
              options={BANKS_BY_COUNTRY.MX}
              value={watch("bankName")}
              onChange={(e) => setValue("bankName", e.target.value)}
            />

            <InputField
              helpText="CLABE (18 dígitos)"
              sizeHelp="xs"
              inputSize="sm"
              rounded="lg"
              placeholder="CLABE"
              {...register("clabe")}
              errorMessage={errors.clabe?.message}
            />
          </>
        );

      case "CO":
        return (
          <>
            <SelectField
              helpText="Banco"
              sizeHelp="xs"
              inputSize="md"
              rounded="lg"
              defaultOption="Selecciona un banco"
              options={BANKS_BY_COUNTRY.CO}
              value={watch("bankName")}
              onChange={(e) => setValue("bankName", e.target.value)}
            />

            <SelectField
              helpText="Tipo de cuenta"
              sizeHelp="xs"
              inputSize="md"
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
              helpText="Número de cuenta"
              sizeHelp="xs"
              inputSize="sm"
              rounded="lg"
              placeholder="Número de cuenta"
              {...register("accountNumber")}
              errorMessage={errors.accountNumber?.message}
            />
          </>
        );

      default:
        return (
          <InputField
            helpText="Número o identificación bancaria"
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
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
      <form onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Text size="sm">
            Por favor, ingresa los datos donde deseas recibir el pago. El pago
            se realizará una vez que el huésped haya ocupado el inmueble.
          </Text>

          <InputField
            helpText="Nombre completo del titular"
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
            placeholder="Nombre completo del titular"
            {...register("fullName")}
            errorMessage={errors.fullName?.message}
          />

          <InputField
            helpText="Correo electrónico"
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
            placeholder="Correo electrónico"
            {...register("email")}
            errorMessage={errors.email?.message}
          />

          <SelectField
            helpText="Método de pago"
            sizeHelp="xs"
            inputSize="md"
            rounded="lg"
            defaultOption="Método de pago"
            options={[
              { label: "Transferencia bancaria", value: "BANK_TRANSFER" },
              { label: "PayPal", value: "PAYPAL" },
            ]}
            value={method}
            onChange={(e) =>
              setValue(
                "paymentMethod",
                e.target.value as "BANK_TRANSFER" | "PAYPAL"
              )
            }
          />

          {method === "BANK_TRANSFER" && (
            <>
              <SelectField
                helpText="País del banco"
                sizeHelp="xs"
                inputSize="md"
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
              placeholder="Correo de PayPal"
              {...register("email")}
              errorMessage={errors.email?.message}
            />
          )}

          {otpSent && (
            <InputField
              helpText="Código OTP"
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
              colVariant="warning"
              type="submit"
              disabled={isSendingOtp}
            >
              {isSendingOtp
                ? "Enviando código..."
                : otpSent
                ? "Confirmar y registrar"
                : "Enviar código OTP"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
