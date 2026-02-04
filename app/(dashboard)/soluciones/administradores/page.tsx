export default function AdministradoresPage() {
  return (
    <main className="bg-white">
      {/* HERO */}
      <section className="py-10 bg-cyan-800 text-white text-center">
        <h1 className="text-4xl font-bold">
          Gestión integral para administradores de propiedad horizontal
        </h1>
        <p className="mt-4 text-gray-300">
          Automatiza procesos, mejora la comunicación y controla la operación
          desde un solo lugar.
        </p>
      </section>

      {/* Problemas */}
      <section className="py-16 max-w-6xl mx-auto px-6">
        <h2 className="text-2xl font-bold mb-6">Problemas que resolvemos</h2>

        <ul className="grid md:grid-cols-3 gap-6">
          <li className="p-6 bg-gray-100 rounded-lg">
            Morosidad difícil de controlar
          </li>
          <li className="p-6 bg-gray-100 rounded-lg">Procesos manuales</li>
          <li className="p-6 bg-gray-100 rounded-lg">Falta de comunicación</li>
        </ul>
      </section>
    </main>
  );
}
