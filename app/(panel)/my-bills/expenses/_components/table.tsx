import React from "react";
import { useInfoExpenseQuery } from "./expense-query";

export default function Table() {
  const { data } = useInfoExpenseQuery();
  return <div>{JSON.stringify(data)}table </div>;
}
