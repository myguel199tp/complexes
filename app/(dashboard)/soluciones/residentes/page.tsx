export default function ResidentesPage() {
  return (
    <main className="bg-gray-50">
      {/* HERO */}
      <section className="py-20 bg-gradient-to-b from-cyan-800 to-cyan-900 text-white text-center px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Tu conjunto, más cerca de ti
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-cyan-100">
          Todo lo que pasa en tu conjunto residencial, accesible desde tu
          celular, sin vueltas ni intermediarios.
        </p>
      </section>

      {/* MENSAJE PRINCIPAL */}
      <section className="py-16 max-w-6xl mx-auto px-6 text-center">
        <p className="text-gray-700 text-lg max-w-4xl mx-auto">
          Ser propietario ya no significa depender de horarios, carteleras o
          mensajes perdidos. La digitalización permite estar informado,
          participar y gestionar tu día a día de forma simple y clara.
        </p>
      </section>

      {/* VENTAJAS PARA RESIDENTES */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-8 rounded-xl shadow-md hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-cyan-700 mb-3">
                Espacios bajo control
              </h3>
              <p className="text-gray-600">
                Consulta disponibilidad y gestiona el uso de las zonas comunes
                sin filas, llamadas ni malentendidos.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-8 rounded-xl shadow-md hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-cyan-700 mb-3">
                Información que sí llega
              </h3>
              <p className="text-gray-600">
                Comunicados, avisos y novedades claras, organizadas y siempre
                disponibles cuando las necesitas.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-8 rounded-xl shadow-md hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-cyan-700 mb-3">
                Vida en comunidad
              </h3>
              <p className="text-gray-600">
                Conecta con servicios, iniciativas y oportunidades dentro del
                mismo conjunto, fortaleciendo la convivencia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CIERRE EMOCIONAL */}
      <section className="py-20 bg-cyan-900 text-white text-center px-6">
        <h2 className="text-3xl font-bold mb-4">
          Más control, menos preocupaciones
        </h2>
        <p className="text-cyan-100 text-lg max-w-3xl mx-auto">
          Un conjunto digital no solo se administra mejor, también se vive mejor
          desde el punto de vista de quienes lo llaman hogar.
        </p>
      </section>
    </main>
  );
}
