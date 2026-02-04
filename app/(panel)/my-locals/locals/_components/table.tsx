"use client";

import React from "react";
import { useLocalsQuery } from "./locals-query";

export default function Table() {
  const { data } = useLocalsQuery();
  return (
    <>
      {JSON.stringify(data)} <div>hola</div>
    </>
  );
}
