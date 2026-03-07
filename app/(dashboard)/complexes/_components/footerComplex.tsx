"use client";

import Link from "next/link";
import { Title, Text, Button, Buton } from "complexes-next-components";
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
      {/* CTA */}
      <div className="border-b border-gray-700 py-12 px-6 text-center">
        <Title as="h3" className="text-white text-3xl font-bold">
          Transforma tu conjunto en un ecosistema digital
        </Title>

        <Text size="md" className="mt-3 text-gray-400">
          Administración, economía comunitaria y tecnología en una sola
          plataforma.
        </Text>

        <div className="mt-6 flex justify-center">
          <Button
            colVariant="warning"
            onClick={() => router.push(route.demost)}
            rounded="lg"
          >
            Solicitar demostración
          </Button>
        </div>
      </div>

      {/* MAIN FOOTER */}
      <div className="max-w-7xl mx-auto px-6 py-16 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 items-start text-center md:text-left">
          {/* BRAND */}
          <div className="space-y-4">
            <Title as="h4" className="text-white text-xl font-bold">
              Complexesph
            </Title>

            <Text size="sm" className="text-gray-400 leading-relaxed">
              Transforma conjuntos residenciales en ecosistemas digitales
              autosostenibles.
            </Text>
          </div>

          {/* SOLUCIONES */}
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

          {/* ECOSISTEMA */}
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

          {/* GESTIÓN */}
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

          {/* EMPRESA */}
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
                  Sobre Complexesph
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

      {/* LEGAL */}
      <div className="border-t border-gray-700 py-8 px-6 text-center text-sm text-gray-400">
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <Link href="#">+57 3330000000</Link>
          <Link href="#">info@complexesph.com</Link>
          <Link href="#">Términos y condiciones</Link>
          <Link href="#">Política de privacidad</Link>
          <Link href="#">Tratamiento de datos</Link>
          <Link href="#">Naturaleza del ecosistema</Link>
        </div>

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
          © {new Date().getFullYear()} Complexesph. Todos los derechos
          reservados. Complexesph facilita la gestión operativa de conjuntos
          residenciales. Cada copropiedad opera de forma independiente y
          autónoma.
        </Text>
      </div>
    </footer>
  );
}
