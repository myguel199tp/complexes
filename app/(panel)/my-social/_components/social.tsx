import React from "react";
import { Text } from "complexes-next-components";

interface Props {
  names: string;
}

export default function Social({ names }: Props) {
  return (
    <div className=" bg-slate-300 p-4 m-4 rounded-md">
      <Text font="bold">{names}</Text>
      <Text>fecha</Text>
      <Text>Imagen</Text>
    </div>
  );
}
