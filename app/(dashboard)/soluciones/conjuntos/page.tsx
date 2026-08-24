"use client";
import { Text, Title } from "complexes-next-components";
export default function ConjuntosPage() {
  return (
    <main className="bg-gray-50">
      <section className="py-20 bg-gradient-to-r from-cyan-700 to-cyan-900 text-white text-center px-6">
        <Title as="h1" size="md" font="bold" className="md:text-5xl mb-6">
          El futuro de los conjuntos residenciales es digital
        </Title>
        <Text className="max-w-3xl mx-auto text-lg md:text-xl text-cyan-100">
          Administrar un conjunto hoy ya no es solo llevar cuentas, es crear
          orden, confianza y una mejor experiencia para todos.
        </Text>
      </section>

      <section className="py-16 max-w-6xl mx-auto px-6 text-center">
        <Text className="text-gray-700 text-lg max-w-4xl mx-auto">
          Los conjuntos residenciales están evolucionando. La información en
          papel, los mensajes dispersos y los procesos manuales generan
          retrasos, confusión y pérdida de tiempo. La digitalización transforma
          esta realidad en algo más simple, claro y organizado.
        </Text>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-xl shadow-md">
              <Text as="h3" size="md" font="semi" className="text-cyan-700 mb-3">
                Orden y claridad
              </Text>
              <Text size="sm" className="text-gray-600">
                Toda la información del conjunto en un solo lugar, accesible
                cuando se necesita y sin depender de terceros.
              </Text>
            </div>

            <div className="p-6 rounded-xl shadow-md">
              <Text as="h3" size="md" font="semi" className="text-cyan-700 mb-3">
                Tiempo mejor aprovechado
              </Text>
              <Text size="sm" className="text-gray-600">
                Menos tareas repetitivas, menos preguntas frecuentes y más
                tiempo para enfocarse en lo realmente importante.
              </Text>
            </div>

            <div className="p-6 rounded-xl shadow-md">
              <Text as="h3" size="md" font="semi" className="text-cyan-700 mb-3">
                Comunidad conectada
              </Text>
              <Text size="sm" className="text-gray-600">
                La comunicación fluye, las decisiones se entienden y los
                residentes se sienten parte del conjunto.
              </Text>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-cyan-900 text-white text-center px-6">
        <Title as="h2" size="sm" font="bold" className="mb-4">
          Digitalizar no es cambiar la esencia,
        </Title>
        <Text className="text-cyan-100 text-lg max-w-3xl mx-auto">
          es darle al conjunto las herramientas para funcionar mejor, con menos
          fricción y más tranquilidad en el día a día.
        </Text>
      </section>
    </main>
  );
}
