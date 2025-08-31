"use client";

import React from "react";
import Payments from "./register-complex/payments";
import FormConjunto from "./register-conjuto/form";
import FormComplex from "./register-complex/form";
import { useRegisterStore } from "./store/registerStore";

export default function PropertyRegister() {
  const { showFirst, showTwo, showThree } = useRegisterStore();

  return (
    <div className="flex justify-center items-center w-full h-full">
      {showFirst && <Payments />}
      {showTwo && <FormConjunto />}
      {showThree && <FormComplex />}
    </div>
  );
}
