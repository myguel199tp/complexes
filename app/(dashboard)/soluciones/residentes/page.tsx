export default function ResidentesPage() {
  return (
    <main>
      <section className="py-10 bg-cyan-800 text-white text-center">
        <h1 className="text-4xl font-bold">Tu conjunto en tu celular</h1>
      </section>

      <section className="py-16 max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-gray-100 rounded-lg">
            Reservas de zonas comunes
          </div>

          <div className="p-6 bg-gray-100 rounded-lg">
            Comunicaciones del conjunto
          </div>

          <div className="p-6 bg-gray-100 rounded-lg">
            Marketplace residencial
          </div>
        </div>
      </section>
    </main>
  );
}
