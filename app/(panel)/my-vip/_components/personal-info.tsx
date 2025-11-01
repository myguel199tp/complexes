import React from "react";
import { Text } from "complexes-next-components";

export default function PersonalInfo() {
  return (
    <>
      <div className="flex justify-around">
        <div>
          <Text font="bold">Información Personal</Text>
          <Text size="xs">
            Nombre y apellido{" "}
            <Text as="span" font="semi" size="sm">
              demostracion1 demostracion1
            </Text>
          </Text>
          <Text size="xs">
            Pais{" "}
            <Text as="span" font="semi" size="sm">
              Colombia
            </Text>
          </Text>
          <Text size="xs">
            cuidad{" "}
            <Text as="span" font="semi" size="sm">
              Bogotá
            </Text>
          </Text>
          <Text size="xs">
            Indicativo{" "}
            <Text as="span" font="semi" size="sm">
              + 57
            </Text>
          </Text>
          <Text size="xs">
            Telefono{" "}
            <Text as="span" font="semi" size="sm">
              300306669
            </Text>
          </Text>
          <Text size="xs">
            Correo electronico{" "}
            <Text as="span" font="semi" size="sm">
              demostracion1@yopmail.com
            </Text>
          </Text>
          <Text size="xs">
            Número de identificacion{" "}
            <Text as="span" font="semi" size="sm">
              3543564346890
            </Text>
          </Text>
          <Text size="xs">
            Torre{" "}
            <Text as="span" font="semi" size="sm">
              1
            </Text>
          </Text>
          <Text size="xs">
            Apartamento{" "}
            <Text as="span" font="semi" size="sm">
              223
            </Text>
          </Text>
        </div>
        <div>
          <Text font="bold">Informacion familiar</Text>
          <Text size="xs">
            Tiene mascota pet{" "}
            <Text as="span" font="semi" size="sm">
              Si
            </Text>
          </Text>
        </div>
      </div>
      <div className="flex">
        <Text font="bold">
          Información del conjunto{" "}
          <Text as="span" font="semi" size="sm">
            demostracion1 demostracion1
          </Text>
        </Text>
        <Text size="xs">
          Nombre del conjunto{" "}
          <Text as="span" font="semi" size="sm">
            demostracion1 demostracion1
          </Text>
        </Text>
        <Text size="xs">
          Pais del conjunto{" "}
          <Text as="span" font="semi" size="sm">
            demostracion1 demostracion1
          </Text>
        </Text>
        <Text size="xs">
          Barrio del conjunto{" "}
          <Text as="span" font="semi" size="sm">
            demostracion1 demostracion1
          </Text>
        </Text>
        <Text size="xs">
          Ciudad del conjunto{" "}
          <Text as="span" font="semi" size="sm">
            demostracion1 demostracion1
          </Text>
        </Text>
        <Text size="xs">
          Dirección del conjunto{" "}
          <Text as="span" font="semi" size="sm">
            demostracion1 demostracion1
          </Text>
        </Text>
        <Text size="xs">
          Plan del conjunto{" "}
          <Text as="span" font="semi" size="sm">
            demostracion1 demostracion1
          </Text>
        </Text>
      </div>
    </>
  );
}
