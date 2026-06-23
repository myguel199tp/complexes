"use client";

import React from "react";
import { Button, Text } from "complexes-next-components";
import { useFormPayMentUser } from "./use-pay-form";

export function PayUserForm() {
  const { onSubmit, isSubmitting } = useFormPayMentUser();

  return (
    <div className="flex flex-col gap-2 mt-2">
      <Text size="sm">¿Confirmar este pago como aprobado?</Text>
      <Button
        type="button"
        size="sm"
        colVariant="success"
        disabled={isSubmitting}
        onClick={onSubmit}
      >
        {isSubmitting ? "Aprobando..." : "Aprobar pago"}
      </Button>
    </div>
  );
}
