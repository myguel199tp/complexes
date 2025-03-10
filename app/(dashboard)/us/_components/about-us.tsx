"use client";

import { route } from "@/app/_domain/constants/routes";
import { Title, Text, Button } from "complexes-next-components";
import { useRouter } from "next/navigation";
import React from "react";
import {
  FaFacebookSquare,
  FaInstagramSquare,
  FaLinkedin,
  FaYoutubeSquare,
  FaPinterestSquare,
} from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";

export default function Aboutus() {
  const router = useRouter();

  return (
    <div>
      <div className="border border-cyan-800 rounded-md shadow-lg m-4">
        <section className="p-5">
          <Title
            size="xs"
            font="bold"
            className="bg-cyan-800 p-2 rounded-md text-white"
          >
            Sobre nosotros
          </Title>
          <Text className="mt-2">
            <Text as="span" font="bold">
              Complexes
            </Text>{" "}
            es la plataforma integral diseñada para conectar comunidades,
            propietarios y prestadores de servicios en un solo lugar. Nuestra
            misión es facilitar la vida en conjunto, mejorar la gestión
            residencial y promover la economía local.
          </Text>
        </section>
      </div>

      <div className="border border-cyan-800 rounded-md mt-4 shadow-lg m-4">
        <section className="p-5">
          <div className="flex w-full bg-cyan-800 rounded-md justify-between">
            <Title size="xs" font="bold" className="p-2 rounded-md text-white">
              Que ofrecemos
            </Title>
            <Button
              colVariant="warning"
              onClick={() => router.push(route.registerComplex)}
            >
              Inscribir conjunto
            </Button>
          </div>
          <div>
            <Text font="bold">Gestión para Conjuntos Residenciales</Text>
            <Text>
              Optimiza la administración de tu conjunto con herramientas como:
            </Text>
            <ul>
              <li>
                <Text>
                  Citofonía Virtual: Comunicación eficiente entre portería y
                  residentes.
                </Text>
              </li>
              <li>
                <Text>
                  Avisos y Comunicados: Informa rápidamente a toda la comunidad.
                </Text>
              </li>
              <li>
                <Text>
                  Gestión para Actividades: Solicita y organiza eventos sin
                  complicaciones.
                </Text>
              </li>
            </ul>
          </div>
          <div>
            <Text font="bold">Compra, Venta y Arriendo de Inmuebles</Text>
            <Text>
              Facilitamos la publicación y búsqueda de propiedades para que
              vender, arrendar o encontrar tu próximo hogar sea sencillo y
              seguro.
            </Text>
          </div>
          <div>
            <Text font="bold">Marketplace de Productos y Servicios</Text>
            <Text>
              Conecta con la comunidad ofreciendo o adquiriendo productos y
              servicios ideales para residentes y conjuntos residenciales.
            </Text>
          </div>
          <div>
            <Text font="bold">Renta Vacacional</Text>
            <Text>
              Encuentra o publica propiedades para alquiler temporal y disfruta
              de una experiencia cómoda y confiable.
            </Text>
          </div>
        </section>
      </div>

      <div className="flex justify-center mt-5">
        <div>
          <Text font="bold">Puedes seguirnos en:</Text>
          <div className="flex">
            <FaFacebookSquare className="w-12 h-12 text-[#1877F2] hover:text-[#a8aeb7fc] cursor-pointer" />
            <FaLinkedin className="w-12 h-12 text-[#0077B5] hover:text-[#a8aeb7fc] cursor-pointer" />
            <FaYoutubeSquare className="w-12 h-12 text-[#FF0000] hover:text-[#a8aeb7fc] cursor-pointer" />
            <FaInstagramSquare className="w-12 h-12 text-[#E1306C] hover:text-[#a8aeb7fc] cursor-pointer" />
            <FaSquareXTwitter className="w-12 h-12 text-[#1D9BF0] hover:text-[#a8aeb7fc] cursor-pointer" />
            <FaPinterestSquare className="w-12 h-12 text-[#E60023] hover:text-[#a8aeb7fc] cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  );
}
