"use client";
import React, { useState } from "react";
import Form from "./form";
import { useTranslation } from "react-i18next";
import { route } from "@/app/_domain/constants/routes";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/hooks/useLanguage";
import { CiViewTable } from "react-icons/ci";
import { HeaderAction } from "@/app/components/header";
import { ImSpinner9 } from "react-icons/im";
import { FaCogs } from "react-icons/fa";
import { Button, Text } from "complexes-next-components";

export default function NewRegisterUSer() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleNavigate = () => {
    setLoading(true);
    router.push(route.user);
  };
  return (
    <div key={language}>
      <HeaderAction
        title={t("agregarUsuario")}
        tooltip={t("usuariosAgregados")}
        onClick={handleNavigate}
        icon={
          loading ? (
            <ImSpinner9 className="animate-spin text-white text-xl" />
          ) : (
            <CiViewTable color="white" size={34} />
          )
        }
        iconc={
          <div
            onClick={() => setShowInfo((prev) => !prev)}
            className="cursor-pointer"
          >
            <FaCogs color="white" size={34} />
          </div>
        }
      />
      <div className="w-full flex gap-2">
        {/* FORM */}
        <div className={showInfo ? "flex-1" : "w-full"}>
          <Form />
        </div>

        {showInfo && (
          <div
            className="
                    flex flex-col gap-3 p-3 shadow-lg border rounded-lg
                    w-full md:w-[220px]
                    max-h-[300px] md:max-h-[500px]
                    overflow-y-auto scrollbar-hide
                    mt-2
                  "
          >
            <Text size="xs" font="bold">
              ¿Qué puedes hacer?
            </Text>
            <Text size="xs">
              En este modulo es donde registraras a los porpietatios de cada una
              de los habitats de la unidad sea apartamento o casa registando
              toda al información necesaria
            </Text>

            <Text size="xs" font="bold">
              ¿Cómo funciona?
            </Text>
            <Text size="xs">
              1. Escribe el nombre. <br />
              <hr />
              2. escribe el apellido <br />
              <hr />
              3. Numero de identificación cedula pasaporte o documento
              correspondiente. <br />
              <hr />
              5. Indicativo del pais 6. Número de celular del propietario 7.
              Correo electronico. <br />
              <hr />
              8. Asignacion de deposito (Esto es opcional solo aplica si el
              Conjunto cuenta con deposito). <br />
              <hr />
              9. Definir si tienes mascotas. <br />
              <hr />
              10. Definir si vive en la porpiedad. <br />
              <hr />
              11. Agrega una foto o aun mejor toma foto del propietario <br />
              <hr />
              12. Selecciona pais de nacimiento del propietario <br />
              <hr />
              13. Selecciona ciudad de nacimiento del propietario <br />
              <hr />
              14. Escribe torre-bloque-manzana donde se encuentre el habitad ya
              sea Casa o apartamento (Si es un edificio puedes poner simplemente
              1) . <br />
              <hr />
              15. Escribe la nomenclatura correspondiente al habitad apartamento
              o casa segun. <br />
              <hr />
              16. Registro de vehiculos <br />
              <hr />
              16.1. Seleccciona el tipo de vehiculo que tengas <br />
              <hr /> 16.2. Selecciona si este cuenta con parqueadero privado o
              publico <br />
              <hr />
              16.3. Escribe el numero del espacio donde se parqueara el vehiculo
              <br />
              <hr />
              16.4. Escribe la nomenclatura la placa del vehiculo <br />
              <hr />
              17. Integranntes del hogar Agrega los familiares personas que
              habitan o viven junto con el propietario <br />
              <hr /> 17.1 Escribe la relación o familiaridad que tiene con el
              propietario <br />
              <hr /> 17.2 Nombre completo del familiar o persona que tambein
              ahbitara el lugar <br />
              <hr /> 17.3 Número de identificación <br />
              <hr /> 17.4 correo electronico del familiar o persona que tambein
              habitara el lugar
              <br />
              <hr />
              17.5. Indicativo del pais <br />
              <hr /> 17.6. Número de celular familiar o persona que habita en el
              lugar <br />
              <hr /> 17.7. fecha de nacimiento
              <br />
              <hr />
              17.8. Agrega una foto o aun mejor toma foto del propietario <br />
              <hr />
              <br /> A los propietarios y familaires les llegara un mensaje al
              correo con una clave provisional
            </Text>

            <Text size="xs" font="bold">
              Paquetes adicionales
            </Text>
            <Text size="xs">
              Tu plan actual es básico y tiene un límite de familiares. Si
              quieres agregar mas puedes comprar el paquete
            </Text>

            <div className="flex flex-col gap-4 mt-2">
              <div className="border rounded-lg p-4 shadow-sm">
                <Text size="xs" font="bold">
                  📦 Básico familiar
                </Text>
                <Text size="xs">+3 familares adicionales</Text>
                <Text size="xs" font="semi">
                  $15.000 COP
                </Text>
                <Button size="xs" className="mt-3 w-full">
                  Comprar paquete
                </Button>
              </div>

              <div className="border rounded-lg p-4 shadow-sm">
                <Text size="xs" font="bold">
                  📦 Pro familares
                </Text>
                <Text size="xs">+5 familaires adicionales</Text>
                <Text size="xs" font="semi">
                  $35.000 COP
                </Text>
                <Button size="xs" className="mt-3 w-full">
                  Comprar paquete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
