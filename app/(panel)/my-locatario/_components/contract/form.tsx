"use client";
import React, { useRef, useState } from "react";
import { InputField, Button, Text } from "complexes-next-components";
import { IoDocumentAttach } from "react-icons/io5";
import useFormContract from "./use-form";

interface Props {
  tenantID: string;
  torre: string;
  apartment: string;
}

export default function ContractForm({ tenantID, torre, apartment }: Props) {
  const { register, setValue, onSubmit, errors, isLoading } = useFormContract({
    tenantID,
    torre,
    apartment,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setValue("file", file, { shouldValidate: true });
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 p-6">
      <InputField
        type="number"
        placeholder="Valor arriendo"
        {...register("rentAmount")}
        hasError={!!errors.rentAmount}
        errorMessage={errors.rentAmount?.message}
      />

      <InputField
        type="number"
        placeholder="Día de pago (1-31)"
        {...register("paymentDay")}
        hasError={!!errors.paymentDay}
        errorMessage={errors.paymentDay?.message}
      />

      <InputField
        type="date"
        {...register("startDate")}
        hasError={!!errors.startDate}
        errorMessage={errors.startDate?.message}
      />

      <InputField
        type="date"
        {...register("endDate")}
        hasError={!!errors.endDate}
        errorMessage={errors.endDate?.message}
      />

      <InputField placeholder="Notas (opcional)" {...register("notes")} />

      {/* FILE */}
      <div className="border-dashed border p-4 rounded-xl text-center">
        {!preview && (
          <IoDocumentAttach
            size={100}
            className="cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          />
        )}

        <input
          type="file"
          hidden
          ref={fileInputRef}
          accept="application/pdf"
          onChange={handleFileChange}
        />

        {preview && <iframe src={preview} className="w-full h-64 mt-2" />}

        {errors.file && <Text colVariant="danger">{errors.file.message}</Text>}
      </div>

      <Button
        type="submit"
        colVariant="success"
        size="full"
        disabled={isLoading}
      >
        asignar contrato
      </Button>
    </form>
  );
}
