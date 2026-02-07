export default function ConveniosPage() {
  return (
    <main className="relative bg-slate-950 text-white overflow-hidden">
      {/* BLURS DECORATIVOS */}
      <div className="absolute top-[-120px] left-[-120px] w-[420px] h-[420px] bg-indigo-600/30 rounded-full blur-3xl" />
      <div className="absolute top-[40%] right-[-150px] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-150px] left-[20%] w-[380px] h-[380px] bg-fuchsia-500/20 rounded-full blur-3xl" />

      {/* HERO */}
      <section className="relative max-w-7xl mx-auto px-6 py-28 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Alianzas que amplifican el valor del conjunto
          </h1>
          <p className="text-slate-300 text-lg max-w-xl">
            ComplexesPH crea un entorno donde servicios, comercios y conjuntos
            se conectan de forma natural para generar nuevas oportunidades.
          </p>
        </div>

        {/* GLASS PANEL */}
        <div className="relative">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-10 shadow-2xl">
            <p className="text-sm uppercase tracking-wider text-slate-400 mb-3">
              Ecosistema digital
            </p>
            <p className="text-xl text-slate-100">
              Los convenios dejan de ser acuerdos aislados y se convierten en
              una red viva que evoluciona con cada alianza.
            </p>
          </div>
        </div>
      </section>

      {/* BLOQUES EDITORIALES */}
      <section className="relative max-w-6xl mx-auto px-6 pb-28 space-y-24">
        {/* Bloque 1 */}
        <div className="grid md:grid-cols-3 gap-10 items-start">
          <h2 className="text-3xl font-semibold text-white md:col-span-1">
            Servicios integrados
          </h2>
          <p className="md:col-span-2 text-slate-300 text-lg leading-relaxed">
            Los conjuntos acceden a soluciones alineadas con su dinámica diaria,
            facilitando la conexión con proveedores que entienden el contexto
            residencial.
          </p>
        </div>

        {/* Bloque 2 */}
        <div className="grid md:grid-cols-3 gap-10 items-start">
          <h2 className="text-3xl font-semibold text-white md:col-span-1">
            Comercio cercano
          </h2>
          <p className="md:col-span-2 text-slate-300 text-lg leading-relaxed">
            Marcas y comercios encuentran un canal directo para integrarse a la
            comunidad, creando relaciones sostenibles y relevantes.
          </p>
        </div>

        {/* Bloque 3 */}
        <div className="grid md:grid-cols-3 gap-10 items-start">
          <h2 className="text-3xl font-semibold text-white md:col-span-1">
            Red en expansión
          </h2>
          <p className="md:col-span-2 text-slate-300 text-lg leading-relaxed">
            Cada nueva alianza fortalece el ecosistema y amplía las
            posibilidades para los conjuntos que hacen parte de él.
          </p>
        </div>
      </section>

      {/* CIERRE */}
      <section className="relative bg-white/5 backdrop-blur-xl border-t border-white/10 py-20 text-center px-6">
        <p className="text-2xl font-medium text-slate-100 max-w-4xl mx-auto">
          ComplexesPH conecta comunidades con oportunidades reales, creando un
          ecosistema donde todos crecen juntos.
        </p>
      </section>
    </main>
  );
}
