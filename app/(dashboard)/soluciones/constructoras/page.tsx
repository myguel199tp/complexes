"use client";
import { Title } from "complexes-next-components";
export default function ConstructorasPage() {
  return (
    <main>
      <section className="py-20 bg-gray-900 text-white text-center">
        <Title as="h1" size="md" font="bold">
          Digitaliza la entrega de tus proyectos inmobiliarios
        </Title>
      </section>

      <section className="py-16 max-w-6xl mx-auto px-6">
        <ul className="space-y-4">
          <li>Gestión de preventas</li>
          <li>Entrega digital de inmuebles</li>
          <li>Comunidad desde el primer día</li>
        </ul>
      </section>
    </main>
  );
}
