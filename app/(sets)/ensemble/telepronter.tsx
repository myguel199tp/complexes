"use client";

import React, { useEffect, useRef } from "react";
import { Title } from "complexes-next-components";

export default function Teleprompter() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const speed = 0.4; // 👉 velocidad (1 = normal, 0.5 = lento, 2 = rápido)

    const interval = setInterval(() => {
      container.scrollTop += speed;

      if (
        container.scrollTop + container.clientHeight >=
        container.scrollHeight
      ) {
        clearInterval(interval);
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        height: "100vh",
        overflowY: "auto",
        background: "#000",
        color: "#fff",
        padding: "120px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 1300,
          margin: "0 auto",
          lineHeight: 1.8,
          paddingBottom: "400px", // 🔑 fuerza scroll
        }}
      >
        <Title font="bold" className="mt-2 text-9xl text-center">
          Hola tiburones, mi nombre es Dolca Puello y hoy estoy aquí para
          presentarles a JDJ ML, una empresa de máquinas dispensadoras de
          alimentos pensada para las grandes ciudades de Colombia. Buscamos una
          inversión de mil millones a cambio del diez por ciento de
          participación.
        </Title>

        <Title font="bold" className="mt-2 text-9xl text-center">
          Nuestra propuesta de valor es simple pero poderosa: ofrecer alimentos
          de calidad, disponibles veinticuatro siete, de forma rápida, segura y
          accesible, en lugares donde hoy no existe una oferta constante de
          comida.
        </Title>

        <Title font="bold" className="mt-2 text-9xl text-center">
          En Colombia, miles de personas pasan largas jornadas en universidades,
          hospitales y batallones. Sin embargo, fuera de los horarios
          tradicionales, encontrar comida de calidad se vuelve casi imposible.
        </Title>

        <Title font="bold" className="mt-2 text-9xl text-center">
          Estudiantes que estudian de noche, personal de salud en turnos
          extensos y militares en servicio se ven obligados a consumir comida
          ultraprocesada, saltarse comidas o depender de opciones informales.
        </Title>

        <Title font="bold" className="mt-2 text-9xl text-center">
          El problema no es la falta de hambre, es la falta de acceso inmediato
          a alimentos adecuados.
        </Title>

        {/* 3. Solución */}
        <Title font="bold" className="mt-2 text-9xl text-center">
          JDJ instalará máquinas dispensadoras inteligentes con una oferta
          curada de alimentos: platos listos, snacks saludables, bebidas
          funcionales y opciones tradicionales.
        </Title>

        <Title font="bold" className="mt-2 text-9xl text-center">
          Nuestras máquinas estarán ubicadas estratégicamente, funcionando
          veinticuatro siete, aceptando múltiples medios de pago y garantizando
          frescura, higiene y rapidez.
        </Title>

        <Title font="bold" className="mt-2 text-9xl text-center">
          En menos de un minuto, una persona puede acceder a un alimento
          confiable cuando más lo necesita.
        </Title>

        {/* 4. Mercado */}
        <Title font="bold" className="mt-2 text-9xl text-center">
          Nuestro público objetivo se divide en tres grandes segmentos.
        </Title>

        <Title font="bold" className="mt-2 text-9xl text-center">
          Estudiantes universitarios, especialmente en jornadas nocturnas.
        </Title>

        <Title font="bold" className="mt-2 text-9xl text-center">
          Personal de salud y visitantes en hospitales.
        </Title>

        <Title font="bold" className="mt-2 text-9xl text-center">
          Personal militar en batallones y centros de formación.
        </Title>

        <Title font="bold" className="mt-2 text-9xl text-center">
          Solo en las principales ciudades de Colombia existen cientos de
          universidades, hospitales y batallones con alto flujo diario de
          personas.
        </Title>

        <Title font="bold" className="mt-2 text-9xl text-center">
          Esto representa un mercado amplio, recurrente y con una necesidad
          constante de alimentación inmediata.
        </Title>

        {/* 5. Modelo de negocio */}
        <Title font="bold" className="mt-2 text-9xl text-center">
          Nuestro modelo de negocio se basa en la venta directa de productos a
          través de las máquinas dispensadoras.
        </Title>

        <Title font="bold" className="mt-2 text-9xl text-center">
          Los ingresos provienen del margen por producto, con rotación diaria y
          costos operativos controlados.
        </Title>

        <Title font="bold" className="mt-2 text-9xl text-center">
          Además, negociamos acuerdos con proveedores locales y alianzas con las
          instituciones donde se ubican las máquinas.
        </Title>

        <Title font="bold" className="mt-2 text-9xl text-center">
          Una sola máquina puede recuperar su inversión en aproximadamente doce
          meses, generando ingresos constantes y escalables.
        </Title>

        {/* 6. Diferenciación */}
        <Title font="bold" className="mt-2 text-9xl text-center">
          A diferencia de las máquinas tradicionales, JDJ se enfoca en alimentos
          de mejor calidad nutricional.
        </Title>

        <Title font="bold" className="mt-2 text-9xl text-center">
          Adaptación total al contexto colombiano.
        </Title>

        <Title font="bold" className="mt-2 text-9xl text-center">
          Ubicaciones estratégicas con alta demanda insatisfecha.
        </Title>

        <Title font="bold" className="mt-2 text-9xl text-center">
          Operación veinticuatro siete con tecnología de control y reposición.
        </Title>

        <Title font="bold" className="mt-2 text-9xl text-center">
          No vendemos solo snacks, vendemos tranquilidad, conveniencia y
          bienestar.
        </Title>

        {/* 7. Cierre */}
        <Title font="bold" className="mt-2 text-9xl text-center">
          Hoy buscamos un socio estratégico que crea en el potencial de
          transformar la forma en que las personas acceden a la alimentación en
          Colombia.
        </Title>

        <Title font="bold" className="mt-2 text-9xl text-center">
          Con su inversión, podremos escalar, llegar a más ciudades y
          posicionarnos como líderes en dispensación inteligente de alimentos.
        </Title>

        <Title font="bold" className="mt-2 text-9xl text-center">
          Tiburones, esta es una oportunidad de invertir en un negocio rentable,
          escalable y con impacto real.
        </Title>

        <Title font="bold" className="mt-2 text-9xl text-center">
          ¿Quién se suma a JDJ?
        </Title>

        <Title font="bold" className="mt-2 text-9xl text-center">
          Bienvenidos.
        </Title>
      </div>
    </div>
  );
}
