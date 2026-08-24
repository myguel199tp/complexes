"use client";
import { route } from "@/app/_domain/constants/routes";
import { Button, Text, Title } from "complexes-next-components";
import { useRouter } from "next/navigation";

export default function ConveniosPage() {
  const router = useRouter();
  return (
    <main className="relative bg-slate-950 text-white overflow-hidden">
      <div className="absolute top-[-120px] left-[-120px] w-[420px] h-[420px] bg-indigo-600/30 rounded-full blur-3xl" />
      <div className="absolute top-[40%] right-[-150px] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-150px] left-[20%] w-[380px] h-[380px] bg-fuchsia-500/20 rounded-full blur-3xl" />

      <section className="relative max-w-7xl mx-auto px-6 py-28 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <Title as="h1" size="md" font="bold" className="leading-tight mb-6">
            Alianzas que amplifican el valor del conjunto
          </Title>
          <Text className="text-slate-300 text-lg max-w-xl">
            SmartPH crea un entorno donde servicios, comercios y conjuntos se
            conectan de forma natural para generar nuevas oportunidades.
          </Text>
          <Button
            colVariant="success"
            onClick={() => router.push(route.demost)}
            rounded="lg"
          >
            Solicitar demostración
          </Button>
        </div>

        <div className="relative">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-10 shadow-2xl">
            <Text size="sm" className="uppercase tracking-wider text-slate-400 mb-3">
              Ecosistema digital
            </Text>
            <Text size="md" className="text-slate-100">
              Los convenios dejan de ser acuerdos aislados y se convierten en
              una red viva que evoluciona con cada alianza.
            </Text>
          </div>
        </div>
      </section>

      <section className="relative max-w-6xl mx-auto px-6 pb-28 space-y-24">
        <div className="grid md:grid-cols-3 gap-10 items-start">
          <Title as="h2" size="sm" font="semi" colVariant="on" className="md:col-span-1">
            Servicios integrados
          </Title>
          <Text className="md:col-span-2 text-slate-300 text-lg leading-relaxed">
            Los conjuntos acceden a soluciones alineadas con su dinámica diaria,
            facilitando la conexión con proveedores que entienden el contexto
            residencial.
          </Text>
        </div>

        <div className="grid md:grid-cols-3 gap-10 items-start">
          <Title as="h2" size="sm" font="semi" colVariant="on" className="md:col-span-1">
            Comercio cercano
          </Title>
          <Text className="md:col-span-2 text-slate-300 text-lg leading-relaxed">
            Marcas y comercios encuentran un canal directo para integrarse a la
            comunidad, creando relaciones sostenibles y relevantes.
          </Text>
        </div>

        <div className="grid md:grid-cols-3 gap-10 items-start">
          <Title as="h2" size="sm" font="semi" colVariant="on" className="md:col-span-1">
            Red en expansión
          </Title>
          <Text className="md:col-span-2 text-slate-300 text-lg leading-relaxed">
            Cada nueva alianza fortalece el ecosistema y amplía las
            posibilidades para los conjuntos que hacen parte de él.
          </Text>
        </div>
      </section>

      <section className="relative bg-white/5 backdrop-blur-xl border-t border-white/10 py-20 text-center px-6">
        <Text size="lg" className="font-medium text-slate-100 max-w-4xl mx-auto">
          SmartPH conecta comunidades con oportunidades reales, creando un
          ecosistema donde todos crecen juntos.
        </Text>
      </section>
    </main>
  );
}
