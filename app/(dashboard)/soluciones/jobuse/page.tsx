export default function JobsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-6">
      <section className="max-w-2xl w-full bg-white border border-gray-100 shadow-xl rounded-3xl p-12 text-center">
        {/* Badge visual */}
        <div className="inline-flex items-center justify-center bg-orange-100 text-orange-600 font-semibold px-4 py-2 rounded-full text-sm mb-6">
          Oportunidades laborales
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Trabaja con nosotros
        </h1>

        <p className="text-gray-600 text-lg leading-relaxed">
          Actualmente no contamos con ofertas laborales disponibles en
          <span className="font-semibold"> ComplexesPH</span>. Estamos en
          constante crecimiento y buscamos personas apasionadas por la
          tecnología, la innovación y la transformación digital.
        </p>

        <p className="text-gray-500 mt-4">
          Te invitamos a estar atento a nuestras próximas convocatorias.
        </p>

        {/* Divider elegante */}
        <div className="my-8 h-px bg-gray-200" />

        {/* Botón */}
        <a
          href="mailto:talento@complexesph.com"
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl transition shadow-md hover:shadow-lg"
        >
          Enviar hoja de vida
        </a>
      </section>
    </main>
  );
}
