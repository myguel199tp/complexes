import {
  Buton,
  Button,
  Modal,
  Text,
  InputField,
} from "complexes-next-components";
import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export default function ModalInmovables({ isOpen, onClose, title }: Props) {
  return (
    <div className="w-full">
      <Modal isOpen={isOpen} onClose={onClose} title={title}>
        <div className="flex gap-2 justify-center">
          <Buton>Arriendos</Buton>
          <Buton>Ventas</Buton>
        </div>
        <Text
          size="md"
          font="bold"
          className="bg-cyan-800 rounded-md p-1 m-2 text-white"
        >
          Precio
        </Text>
        <div className="flex gap-2">
          <div>
            <InputField placeholder="Desde COP" />
          </div>
          <div>
            <InputField placeholder="Hasta COP" />
          </div>
        </div>
        <Text
          size="md"
          font="bold"
          className="bg-cyan-800 rounded-md p-1 m-2 text-white"
        >
          Estrato
        </Text>
        <div className="flex gap-2">
          <Button>Todos</Button>
          <Button>1</Button>
          <Button>2</Button>
          <Button>3</Button>
          <Button>4</Button>
          <Button>5</Button>
          <Button>6</Button>
        </div>
        <Text
          size="md"
          font="bold"
          className="bg-cyan-800 rounded-md p-1 m-2 text-white"
        >
          Antiguedad del inmueble
        </Text>
        <div className="flex gap-2">
          <Button size="sm">Todos</Button>
          <Button size="sm">Menos de 1 año</Button>
          <Button size="sm">1 a 5 años</Button>
          <Button size="sm">6 a 10 años</Button>
          <Button size="sm">10 a 25 años</Button>
          <Button size="sm">Más de 25 años</Button>
        </div>
        <Text
          size="md"
          font="bold"
          className="bg-cyan-800 rounded-md p-1 m-2 text-white"
        >
          Area
        </Text>
        <div className="flex gap-2">
          <div>
            <InputField placeholder="Desde M2" />
          </div>
          <div>
            <InputField placeholder="Hasta M2" />
          </div>
        </div>
        <Text
          size="md"
          font="bold"
          className="bg-cyan-800 rounded-md p-1 m-2 text-white"
        >
          Espacios
        </Text>
        <Text size="sm">Habitaciones</Text>
        <div className="flex gap-2">
          <Button>Todos</Button>
          <Button>1</Button>
          <Button>2</Button>
          <Button>3</Button>
          <Button>4</Button>
          <Button>5</Button>
          <Button>6</Button>
        </div>
        <Text size="sm">Baños</Text>
        <div className="flex gap-2">
          <Button>Todos</Button>
          <Button>1</Button>
          <Button>2</Button>
          <Button>3</Button>
          <Button>4</Button>
          <Button>5</Button>
          <Button>6</Button>
        </div>
        <div className="flex justify-center mt-2">
          <Button>Aplicar filtros</Button>
        </div>
      </Modal>
    </div>
  );
}
