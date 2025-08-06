"use client";

import { Title } from "complexes-next-components";
import React from "react";
import Payments from "./register-complex/payments";
import FormConjunto from "./register-conjuto/form";
import FormComplex from "./register-complex/form";
import { useRegisterStore } from "./store/registerStore";

export default function PropertyRegister() {
  const { showFirst, showTwo, showThree } = useRegisterStore();

  return (
    <div>
      <Title size="md" className="m-4" font="semi" as="h2">
        Registrar Propiedad
      </Title>

      {showFirst && <Payments />}
      {showTwo && <FormConjunto />}
      {showThree && <FormComplex />}
    </div>
  );
}
