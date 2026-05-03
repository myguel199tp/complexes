"use client";

import { Buton, InputField } from "complexes-next-components";

export default function ModalTransfer({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center overflow-y-auto">
      <div className="bg-white p-6 rounded-xl w-[700px] space-y-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold">Transferir propiedad</h2>

        {/* 🔥 OWNER */}
        <div className="space-y-3">
          <h3 className="font-semibold">Nuevo propietario</h3>

          <InputField placeholder="Nombre" />
          <InputField placeholder="Apellido" />
          <InputField placeholder="Correo" />
          <InputField placeholder="Teléfono" />
          <InputField placeholder="Indicativo (+57)" />
          <InputField placeholder="Cédula" />
          <InputField placeholder="País" />
          <InputField placeholder="Ciudad" />
          <InputField placeholder="Torre" />

          <input type="file" />
        </div>

        {/* 🔥 FAMILIARES */}
        <div className="space-y-3">
          <h3 className="font-semibold">Familiares</h3>

          {/* ITEM */}
          <div className="border p-3 rounded-lg space-y-2">
            <InputField placeholder="Nombre completo" />
            <InputField placeholder="Apellido" />
            <InputField placeholder="Correo" />
            <InputField placeholder="Teléfono" />
            <InputField placeholder="Indicativo" />
            <InputField placeholder="Cédula" />
            <InputField placeholder="Fecha nacimiento" />
            <InputField placeholder="País" />
            <InputField placeholder="Ciudad" />
          </div>

          <Buton>+ Agregar familiar</Buton>
        </div>

        {/* 🔥 VEHÍCULOS */}
        <div className="space-y-3">
          <h3 className="font-semibold">Vehículos</h3>

          <div className="border p-3 rounded-lg space-y-2">
            <InputField placeholder="Placa" />
            <InputField placeholder="Tipo (carro, moto...)" />
            <InputField placeholder="Número asignación" />
          </div>

          <Buton>+ Agregar vehículo</Buton>
        </div>

        {/* 🔥 BOTONES */}
        <div className="flex justify-end gap-3">
          <Buton onClick={onClose}>Cancelar</Buton>
          <Buton>Transferir</Buton>
        </div>
      </div>
    </div>
  );
}
