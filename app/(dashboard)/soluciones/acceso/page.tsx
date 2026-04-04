export default function AccesoPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="py-16 bg-cyan-800 text-white text-center px-6">
        <h1 className="text-4xl font-bold mb-4">
          Control de acceso inteligente
        </h1>

        <p className="max-w-3xl mx-auto text-cyan-100 text-lg leading-relaxed">
          El módulo de control de acceso inteligente permite gestionar de forma
          segura y organizada el ingreso de visitantes, residentes y vehículos
          dentro del conjunto residencial. A través de herramientas diseñadas
          para facilitar la labor del personal de portería y de la
          administración, es posible mantener un registro detallado de cada
          acceso, mejorar la seguridad del conjunto y contar con información
          clara sobre quién entra y sale de la propiedad.
        </p>
      </section>

      {/* FUNCIONALIDADES */}
      <section className="max-w-6xl mx-auto py-14 px-6">
        <h2 className="text-2xl font-semibold text-center mb-10">
          ¿Qué puedes hacer con este módulo?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold text-lg mb-2">
              Registro de visitantes
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Permite registrar de manera rápida a las personas que ingresan al
              conjunto indicando a qué residente visitan, la fecha y la hora del
              ingreso. Esto facilita el control por parte de la portería y
              mantiene un historial claro de las visitas realizadas.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold text-lg mb-2">Historial de accesos</h3>
            <p className="text-gray-600 leading-relaxed">
              Consulta fácilmente los registros de entradas y salidas dentro del
              conjunto. Esta información permite verificar accesos, realizar
              controles de seguridad y mantener un seguimiento organizado de
              todas las visitas.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold text-lg mb-2">Control de vehículos</h3>
            <p className="text-gray-600 leading-relaxed">
              Permite registrar los vehículos visitantes y mantener un control
              del acceso al parqueadero. De esta forma se puede identificar qué
              vehículos han ingresado al conjunto y a qué residente están
              asociados.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold text-lg mb-2">
              Notificaciones a residentes
            </h3>
            <p className="text-gray-600 leading-relaxed">
              El sistema puede informar a los residentes cuando llega un
              visitante, facilitando la confirmación del ingreso y mejorando la
              comunicación entre portería y propietarios.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold text-lg mb-2">
              Seguridad centralizada
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Toda la información de accesos queda registrada dentro del
              sistema, permitiendo a la administración tener un mayor control
              sobre la seguridad del conjunto y consultar los registros cuando
              sea necesario.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
