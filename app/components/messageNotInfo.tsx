import { Text } from "complexes-next-components";
import React from "react";
import { MdErrorOutline } from "react-icons/md";

export default function MessageNotConnect() {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center gap-2 px-4">
      <MdErrorOutline size={48} className="text-cyan-800" />
      <Text className="font-semibold text-gray-700">
        No fue posible cargar la información
      </Text>
      <Text className="text-sm text-gray-500 max-w-md">
        Verifica que tu cuenta esté activa y que tengas los permisos necesarios,
        o intenta nuevamente más tarde si el problema persiste.
      </Text>
    </div>
  );
}
