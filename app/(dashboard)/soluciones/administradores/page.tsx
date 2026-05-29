"use client";
import { route } from "@/app/_domain/constants/routes";
import { Button, Text, Title } from "complexes-next-components";
import { useRouter } from "next/navigation";

export default function AdministradoresPage() {
  const router = useRouter();
  return (
    <main className="bg-gray-50">
      <section className="py-20 bg-gradient-to-r from-cyan-800 to-cyan-900 text-white text-center px-6">
        <Title as="h2" className="text-4xl md:text-5xl font-bold mb-4">
          Administración con control y claridad
        </Title>
        <Text className="mt-4 text-cyan-100 max-w-3xl mx-auto text-lg">
          Digitalizar la gestión del conjunto reduce la carga operativa, ordena
          la información y permite tomar decisiones con datos claros.
        </Text>
        <Button
          colVariant="success"
          onClick={() => router.push(route.demost)}
          rounded="lg"
        >
          Solicitar demostración
        </Button>
      </section>

      <section className="py-16 max-w-6xl mx-auto px-6 text-center">
        <Text className="text-lg max-w-4xl mx-auto">
          La administración tradicional implica múltiples tareas repetitivas,
          información dispersa y comunicación constante por diferentes canales.
          La digitalización transforma ese caos en procesos claros y
          centralizados.
        </Text>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <Title as="h2" className="text-3xl font-bold text-center mb-12">
            Lo que cambia al administrar de forma digital
          </Title>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl shadow-md">
              <Title
                as="h3"
                className="text-xl font-semibold text-cyan-700 mb-3"
              >
                Control financiero
              </Title>
              <Text>
                La información económica deja de estar dispersa y se vuelve
                consultable, ordenada y fácil de supervisar.
              </Text>
            </div>

            <div className="p-8 rounded-xl shadow-md">
              <Title
                as="h3"
                className="text-xl font-semibold text-cyan-700 mb-3"
              >
                Procesos definidos
              </Title>
              <Text>
                Menos tareas manuales, menos reprocesos y más consistencia en la
                operación diaria del conjunto.
              </Text>
            </div>

            <div className="p-4 rounded-xl shadow-md">
              <Title
                as="h3"
                className="text-xl font-semibold text-cyan-700 mb-3"
              >
                Comunicación ordenada
              </Title>
              <Text>
                Los mensajes llegan al lugar correcto, en el momento adecuado y
                sin depender de llamadas o mensajes informales.
              </Text>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-cyan-900 text-white text-center px-6">
        <Title as="h2" className="text-3xl font-bold mb-4">
          Administrar con menos fricción
        </Title>
        <Text className="text-cyan-100 text-lg max-w-3xl mx-auto">
          La digitalización no cambia la responsabilidad del administrador,
          cambia la forma de ejercerla: con más control, menos desgaste y mayor
          confianza.
        </Text>
      </section>
    </main>
  );
}
