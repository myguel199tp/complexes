"use client";
import { route } from "@/app/_domain/constants/routes";
import { Title, Text, Button } from "complexes-next-components";
import { useRouter } from "next/navigation";

const features = [
  {
    title: "Registro de visitantes",
    desc: "Controla ingresos de visitantes con fecha, hora y residente asociado.",
  },
  {
    title: "Historial de accesos",
    desc: "Consulta entradas y salidas de manera rápida y organizada.",
  },
  {
    title: "Control de vehículos",
    desc: "Gestiona vehículos visitantes y su relación con residentes.",
  },
  {
    title: "Notificaciones",
    desc: "Informa automáticamente a los residentes sobre nuevas visitas.",
  },
  {
    title: "Seguridad centralizada",
    desc: "Mantén todos los registros de acceso en un solo lugar.",
  },
];

export default function AccesoPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-cyan-50">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-900 via-cyan-800 to-cyan-950 text-white">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-24 text-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-cyan-100 text-sm mb-6 backdrop-blur-md">
            Seguridad y control residencial
          </div>

          <Title className="text-3xl md:text-5xl font-extrabold tracking-tight mb-5 leading-tight">
            Control de acceso inteligente
          </Title>

          <Text className="max-w-2xl mx-auto text-sm md:text-lg text-cyan-100 leading-relaxed">
            Gestiona visitantes, residentes y vehículos desde una plataforma
            moderna, segura y organizada para mejorar el control y la seguridad
            del conjunto residencial.
          </Text>
        </div>
        <Button
          colVariant="success"
          onClick={() => router.push(route.demost)}
          rounded="lg"
        >
          Solicitar demostración
        </Button>
      </section>

      {/* FUNCIONALIDADES */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
            Funcionalidades principales
          </h2>

          <Text className="text-slate-500 mt-3 text-sm md:text-base">
            Herramientas diseñadas para optimizar el control de accesos.
          </Text>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item, index) => (
            <div
              key={index}
              className="
                group
                bg-white/80
                backdrop-blur-xl
                border border-slate-200
                rounded-2xl
                p-6
                shadow-sm
                hover:shadow-xl
                hover:-translate-y-1
                transition-all duration-300
              "
            >
              <div className="w-11 h-11 rounded-xl bg-cyan-100 flex items-center justify-center mb-4">
                <div className="w-5 h-5 rounded-full bg-cyan-700" />
              </div>

              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                {item.title}
              </h3>

              <Text className="text-sm text-slate-600 leading-relaxed">
                {item.desc}
              </Text>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
