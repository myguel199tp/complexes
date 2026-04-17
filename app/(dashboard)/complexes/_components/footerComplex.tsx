/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { Title, Text, Button, Buton, Avatar } from "complexes-next-components";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import {
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

export default function FooterComplex() {
  const router = useRouter();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-5">
      <div className="border-b border-gray-700 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
          <Avatar
            src="/complex.jpg"
            alt={"SmarPH"}
            size="xxl"
            border="thick"
            shape="round"
          />
          <div>
            <Title as="h3" className="text-white text-3xl font-bold">
              Transforma tu conjunto en un ecosistema digital
            </Title>

            <Text size="md" className="mt-3 text-gray-400">
              Administración, economía comunitaria y tecnología en una sola
              plataforma.
            </Text>

            <div className="mt-6 flex justify-center md:justify-start">
              <Button
                colVariant="success"
                onClick={() => router.push(route.demost)}
                rounded="lg"
              >
                Solicitar demostración
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-16 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 items-start text-center md:text-left">
          <div className="space-y-4">
            <Title as="h4" className="text-white text-xl font-bold">
              SmartPH
            </Title>

            <Text size="sm" className="text-gray-400 leading-relaxed">
              Transforma conjuntos residenciales en ecosistemas digitales
              autosostenibles.
            </Text>
          </div>

          <div className="space-y-4">
            <Title className="text-white font-semibold text-lg">
              Soluciones
            </Title>

            <ul className="text-sm text-gray-400 flex flex-col">
              <li>
                <Buton
                  size="sm"
                  borderWidth="none"
                  colVariant="none"
                  onClick={() => router.push(route.administradores)}
                >
                  Administradores
                </Buton>
              </li>

              <li>
                <Buton
                  size="sm"
                  borderWidth="none"
                  colVariant="none"
                  onClick={() => router.push(route.residentes)}
                >
                  Residentes
                </Buton>
              </li>

              <li>
                <Buton
                  size="sm"
                  borderWidth="none"
                  colVariant="none"
                  onClick={() => router.push(route.conjuntos)}
                >
                  Conjuntos residenciales
                </Buton>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <Title className="text-white font-semibold text-lg">
              Ecosistema económico
            </Title>

            <ul className="space-y-2 text-sm text-gray-400 flex flex-col">
              <li>
                <Buton
                  size="sm"
                  borderWidth="none"
                  colVariant="none"
                  onClick={() => router.push(route.market)}
                >
                  Marketplace residencial
                </Buton>
              </li>

              <li>
                <Buton
                  size="sm"
                  borderWidth="none"
                  colVariant="none"
                  onClick={() => router.push(route.reserva)}
                >
                  Alquiler vacacional
                </Buton>
              </li>

              <li>
                <Buton
                  size="sm"
                  borderWidth="none"
                  colVariant="none"
                  onClick={() => router.push(route.alquileres)}
                >
                  Registro de alquileres externos
                </Buton>
              </li>

              <li>
                <Buton
                  size="sm"
                  borderWidth="none"
                  colVariant="none"
                  onClick={() => router.push(route.convenios)}
                >
                  Convenios y alianzas
                </Buton>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <Title className="text-white font-semibold text-lg">
              Gestión operativa
            </Title>

            <ul className="space-y-2 text-sm text-gray-400 flex flex-col">
              <li>
                <Buton
                  size="sm"
                  borderWidth="none"
                  colVariant="none"
                  onClick={() => router.push(route.cartera)}
                >
                  Control de cartera
                </Buton>
              </li>

              <li>
                <Buton
                  size="sm"
                  borderWidth="none"
                  colVariant="none"
                  onClick={() => router.push(route.comunicaciones)}
                >
                  Comunicaciones
                </Buton>
              </li>

              <li>
                <Buton
                  size="sm"
                  borderWidth="none"
                  colVariant="none"
                  onClick={() => router.push(route.asamblea)}
                >
                  Asambleas y votaciones
                </Buton>
              </li>

              <li>
                <Buton
                  size="sm"
                  borderWidth="none"
                  colVariant="none"
                  onClick={() => router.push(route.documental)}
                >
                  Gestión documental
                </Buton>
              </li>

              <li>
                <Buton
                  size="sm"
                  borderWidth="none"
                  colVariant="none"
                  onClick={() => router.push(route.acceso)}
                >
                  Control de acceso
                </Buton>
              </li>

              <li>
                <Buton
                  size="sm"
                  borderWidth="none"
                  colVariant="none"
                  onClick={() => router.push(route.citofonias)}
                >
                  Citofonía virtual
                </Buton>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <Title className="text-white font-semibold text-lg">Empresa</Title>

            <ul className="space-y-2 text-sm text-gray-400 flex flex-col">
              <li>
                <Buton
                  size="sm"
                  borderWidth="none"
                  colVariant="none"
                  onClick={() => router.push(route.about)}
                >
                  Sobre SmartPH
                </Buton>
              </li>

              <li>
                <Buton
                  size="sm"
                  borderWidth="none"
                  colVariant="none"
                  onClick={() => router.push(route.ecosistemas)}
                >
                  Modelo ecosistema
                </Buton>
              </li>

              <li>
                <Buton
                  size="sm"
                  borderWidth="none"
                  colVariant="none"
                  onClick={() => router.push(route.blogs)}
                >
                  Blog
                </Buton>
              </li>

              <li>
                <Buton
                  size="sm"
                  borderWidth="none"
                  colVariant="none"
                  onClick={() => router.push(route.jubuse)}
                >
                  Trabaja con nosotros
                </Buton>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 py-8 px-6 text-center text-sm text-gray-400">
        <div className="flex justify-center items-center gap-8 text-2xl mb-4">
          <Link href="" target="_blank">
            <FaFacebook className="text-blue-600 hover:scale-110 transition" />
          </Link>

          <Link href="" target="_blank">
            <FaInstagram className="text-pink-500 hover:scale-110 transition" />
          </Link>

          <Link href="" target="_blank">
            <FaTiktok className="hover:scale-110 transition" />
          </Link>

          <Link href="" target="_blank">
            <FaYoutube className="text-red-600 hover:scale-110 transition" />
          </Link>

          <Link href="" target="_blank">
            <FaXTwitter className="hover:scale-110 transition" />
          </Link>
        </div>

        <Text size="xs">
          © {new Date().getFullYear()} SmartPH. Todos los derechos reservados.
          SmartPH facilita la gestión operativa de conjuntos residenciales. Cada
          copropiedad opera de forma independiente y autónoma.
        </Text>
      </div>
    </footer>
  );
}
