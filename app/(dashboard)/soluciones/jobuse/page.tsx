"use client";
import { Title, Text, Button } from "complexes-next-components";

export default function JobsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-6">
      <section className="max-w-2xl w-full bg-white border border-gray-100 shadow-xl rounded-3xl p-12 text-center">
        <div className="inline-flex items-center justify-center bg-orange-100 text-orange-600 font-semibold px-4 py-2 rounded-full text-sm mb-6">
          Oportunidades laborales
        </div>

        <Title size="sm">Trabaja con nosotros</Title>

        <Text size="sm">
          Actualmente no contamos con ofertas laborales disponibles en
          <span className="font-semibold"> SmartPH</span>. Estamos en constante
          crecimiento y buscamos personas apasionadas por la tecnología, la
          innovación y la transformación digital.
        </Text>

        <Text size="sm">
          Te invitamos a estar atento a nuestras próximas convocatorias.
        </Text>

        {/* Divider elegante */}
        <div className="my-8 h-px bg-gray-200" />

        {/* Botón */}
        <Button size="sm" colVariant="warning" disabled>
          Enviar hoja de vida
        </Button>
      </section>
    </main>
  );
}
