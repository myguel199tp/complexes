"use client";
import { route } from "@/app/_domain/constants/routes";
import { Button, Title, Text } from "complexes-next-components";
import { useRouter } from "next/navigation";

export default function ResidentesPage() {
  const router = useRouter();
  return (
    <main className="bg-gray-50">
      <section className="py-20 bg-gradient-to-b from-cyan-800 to-cyan-900 text-white text-center px-6">
        <Title as="h2" className="text-4xl md:text-5xl font-bold mb-4">
          Tu conjunto, más cerca de ti
        </Title>
        <Text className="max-w-3xl mx-auto text-lg md:text-xl text-cyan-100">
          Todo lo que pasa en tu conjunto residencial, accesible desde tu
          celular, sin vueltas ni intermediarios.
        </Text>
        <Button
          colVariant="success"
          onClick={() => router.push(route.demost)}
          rounded="lg"
        >
          Solicitar demostración
        </Button>
      </section>

      <section className="py-5 max-w-6xl mx-auto px-6 text-center">
        <Text className="text-gray-700 text-lg max-w-4xl mx-auto">
          Ser propietario ya no significa depender de horarios, carteleras o
          mensajes perdidos. La digitalización permite estar informado,
          participar y gestionar tu día a día de forma simple y clara.
        </Text>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-4 rounded-xl shadow-md hover:shadow-lg transition">
              <Title
                as="h3"
                className="text-xl font-semibold text-cyan-700 mb-3"
              >
                Espacios bajo control
              </Title>
              <Text>
                Consulta disponibilidad y gestiona el uso de las zonas comunes
                sin filas, llamadas ni malentendidos.
              </Text>
            </div>

            <div className="p-8 rounded-xl shadow-md hover:shadow-lg transition">
              <Title
                as="h3"
                className="text-xl font-semibold text-cyan-700 mb-3"
              >
                Información que sí llega
              </Title>
              <Text>
                Comunicados, avisos y novedades claras, organizadas y siempre
                disponibles cuando las necesitas.
              </Text>
            </div>

            <div className="p-8 rounded-xl shadow-md hover:shadow-lg transition">
              <Title
                as="h3"
                className="text-xl font-semibold text-cyan-700 mb-3"
              >
                Vida en comunidad
              </Title>
              <Text>
                Conecta con servicios, iniciativas y oportunidades dentro del
                mismo conjunto, fortaleciendo la convivencia.
              </Text>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-cyan-900 text-white text-center px-6">
        <Title as="h2" className="text-3xl font-bold mb-4">
          Más control, menos preocupaciones
        </Title>
        <Text className="text-cyan-100 text-lg max-w-3xl mx-auto">
          Un conjunto digital no solo se administra mejor, también se vive mejor
          desde el punto de vista de quienes lo llaman hogar.
        </Text>
      </section>
    </main>
  );
}
