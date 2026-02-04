export default function DemoRequestPage() {
  return (
    <main className="bg-gray-50 min-h-screen">
      {/* HERO */}
      <section className="bg-gradient-to-r from-cyan-900 to-cyan-700 text-white py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          {/* Texto */}
          <div className="space-y-6">
            <h1 className="text-4xl font-bold">
              Solicita una demostración de ComplexesPH
            </h1>

            <p className="text-cyan-100 text-lg">
              Descubre cómo automatizar la administración de tu conjunto
              residencial con nuestra plataforma todo en uno.
            </p>

            <ul className="space-y-2 text-cyan-100">
              <li>✔ Gestión financiera y contable</li>
              <li>✔ Comunicación con residentes</li>
              <li>✔ Control de visitantes y seguridad</li>
              <li>✔ Marketplace y reservas</li>
            </ul>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-gray-800">
            <h3 className="text-xl font-semibold mb-6">
              Agenda tu demostración
            </h3>

            <form className="space-y-4">
              <input
                type="text"
                placeholder="Nombre completo"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-600 outline-none"
              />

              <input
                type="email"
                placeholder="Correo electrónico"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-600 outline-none"
              />

              <input
                type="tel"
                placeholder="Teléfono"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-600 outline-none"
              />

              <input
                type="text"
                placeholder="Nombre del conjunto residencial"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-600 outline-none"
              />

              <select className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-600 outline-none">
                <option>Cantidad de unidades</option>
                <option>1 - 50</option>
                <option>51 - 100</option>
                <option>101 - 300</option>
                <option>Más de 300</option>
              </select>

              <textarea
                placeholder="Mensaje (opcional)"
                rows={3}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-600 outline-none"
              />

              <button
                type="submit"
                className="w-full bg-cyan-700 hover:bg-cyan-800 text-white py-3 rounded-lg font-semibold transition"
              >
                Solicitar demostración
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* QUE INCLUYE */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-10">
            ¿Qué incluye la demostración?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow">
              <h4 className="font-semibold mb-2">Tour completo del sistema</h4>
              <p className="text-gray-600">
                Conoce todas las funcionalidades que ofrece ComplexesPH.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h4 className="font-semibold mb-2">Asesoría personalizada</h4>
              <p className="text-gray-600">
                Evaluamos las necesidades específicas de tu conjunto.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h4 className="font-semibold mb-2">Resolución de dudas</h4>
              <p className="text-gray-600">
                Nuestro equipo responderá todas tus preguntas.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
