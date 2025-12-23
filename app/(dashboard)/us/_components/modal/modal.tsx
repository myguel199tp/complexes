import { Modal, Text, Title } from "complexes-next-components";
import React from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  text: string;
}

const contentData: Record<
  string,
  { conjunto: string[]; cliente: string[]; icon: string }
> = {
  Seguridad: {
    conjunto: [
      "El conjunto podrá implementar un sistema de control de accesos mucho más ágil y eficiente, lo que reduce riesgos en portería y garantiza que solo ingresen personas autorizadas. Todo queda registrado digitalmente, brindando respaldo en caso de inconvenientes.",
      "La administración tendrá comunicación directa y transparente con los equipos de seguridad, evitando confusiones y asegurando que las instrucciones sean claras y oportunas.",
      "Cada ingreso y salida de visitantes, proveedores y residentes quedará trazado en la plataforma, ofreciendo una gestión responsable y confiable para todos.",
    ],
    icon: "🔒",
    cliente: [
      "Como residente tendrás la tranquilidad de que tu hogar está protegido en todo momento, ya que los accesos se registran en tiempo real y puedes consultarlos desde la aplicación.",
      "Tendrás la confianza de que tu familia y tu propiedad están respaldadas por un sistema digital que reduce los errores humanos y refuerza la seguridad del conjunto.",
    ],
  },
  Comunicación: {
    conjunto: [
      "El conjunto contará con un canal de comunicación único y digitalizado, donde se pueden emitir notificaciones masivas a todos los residentes en segundos, evitando depender de carteleras físicas o llamadas que se pueden perder.",
      "Se promueve una relación más cercana entre la administración y los vecinos, ya que los mensajes llegan sin intermediarios ni distorsiones.",
      "La plataforma centraliza toda la comunicación, lo que evita que se pierda información importante y mantiene un historial accesible en todo momento.",
    ],
    icon: "💬",
    cliente: [
      "Como residente recibirás información en tiempo real directamente en tu celular, sin importar dónde estés, lo que garantiza que nunca te pierdas un aviso relevante.",
      "Se evitan malentendidos, ya que los comunicados oficiales estarán disponibles siempre en la aplicación y podrás consultarlos cuando lo necesites.",
    ],
  },
  Comunidad: {
    conjunto: [
      "El conjunto podrá fomentar la colaboración entre vecinos a través de actividades, foros y espacios digitales que integran a la comunidad más allá de las áreas comunes.",
      "Se genera un mayor sentido de pertenencia, lo que impacta positivamente en la convivencia y reduce los conflictos vecinales.",
      "La plataforma facilita la organización de proyectos comunitarios y la participación en iniciativas que beneficien a todos.",
    ],
    icon: "🏘️",
    cliente: [
      "Podrás participar activamente en las actividades del conjunto, expresar tus opiniones y sentir que tu voz tiene valor dentro de la comunidad.",
      "Vivirás en un entorno más armónico y participativo, donde los vecinos no solo comparten un espacio físico, sino también iniciativas y proyectos comunes.",
    ],
  },
  "Alquiler vacacional": {
    conjunto: [
      "El conjunto contará con una herramienta optimizada para gestionar reservas temporales, facilitando la organización de la ocupación, limpieza y mantenimiento de los apartamentos.",
      "Permitirá controlar de manera más segura las entradas y salidas de visitantes, garantizando que los alquileres no afecten la convivencia ni la seguridad de los residentes.",
      "Como parte del modelo de negocio, el conjunto podrá recibir un incentivo económico acumulado cada 6 meses, calculado sobre el total de reservas generadas dentro de su comunidad.",
      "Este beneficio aplica únicamente para conjuntos que mantengan un uso continuo e ininterrumpido de la plataforma durante el periodo semestral correspondiente.",
      "El porcentaje del incentivo varía según el plan activo del conjunto:",
      "🩵 Plan Básico → 1% si el apartamento pertenece a la copropiedad y 0,5% si es externo.",
      "🟡 Plan Oro → 2% si el apartamento pertenece a la copropiedad y 1% si es externo.",
      "💎 Plan Platino → 3% si el apartamento pertenece a la copropiedad y 2% si es externo.",
      "Si el conjunto cambia de plan durante el semestre, el cálculo del incentivo se ajustará proporcionalmente según el tiempo que haya permanecido en cada plan. Por ejemplo, si durante los dos primeros meses estuvo en Plan Básico y los cuatro siguientes en Plan Platino, el incentivo se calculará de acuerdo a cada periodo.",
      "El incentivo se entrega como ingreso comunitario acumulado semestralmente, sin generar costos adicionales para el conjunto ni para los propietarios.",
    ],
    icon: "🏖️",
    cliente: [
      "Como anfitrión, recibirás una ganancia según el plan en el que te encuentres:",
      "🩵 Plan Básico → 85% del valor de la reserva.",
      "🟡 Plan Oro → 87% del valor de la reserva.",
      "💎 Plan Platino → 90% del valor de la reserva.",
      "La plataforma retiene el porcentaje restante por la gestión tecnológica, publicidad, soporte y seguridad del sistema.",
      "Del total retenido, una parte se destina al conjunto como incentivo comunitario (según los porcentajes indicados), fortaleciendo la relación entre propietarios y administración sin reducir tus ingresos.",
      "Además, podrás gestionar tus reservas fácilmente: confirmar o cancelar en pocos clics, acceder al historial completo de operaciones y ofrecer a tus huéspedes una experiencia confiable, segura y transparente.",
    ],
  },
  "Arrienda o vende": {
    conjunto: [
      "El conjunto contará con un espacio exclusivo para que sus residentes publiquen propiedades en arriendo o venta, lo que evita la entrada de intermediarios desconocidos.",
      "La administración puede tener mayor control sobre los procesos, garantizando que las negociaciones se hagan dentro de la comunidad de manera organizada y transparente.",
    ],
    icon: "💰",
    cliente: [
      "Tendrás la posibilidad de publicar tu inmueble directamente en una plataforma confiable, donde los principales interesados son personas que ya pertenecen o están relacionadas con tu conjunto.",
      "Al negociar dentro de tu comunidad, contarás con un nivel de confianza y seguridad mayor que en portales externos.",
    ],
  },
  "Citofonía Virtual": {
    conjunto: [
      "Elimina los costos asociados a los sistemas de citofonía tradicional con equipos físicos, ofreciendo una solución moderna y económica.",
      "Permite comunicación inmediata entre portería y residentes, mejorando la eficiencia en el ingreso de visitantes.",
    ],
    icon: "📞",
    cliente: [
      "Atiende desde tu celular cualquier llamada de portería, sin necesidad de estar en tu apartamento.",
      "Autoriza accesos fácilmente, incluso si estás fuera del conjunto, dándote mayor control y comodidad.",
    ],
  },
  "Gestión de usuarios": {
    conjunto: [
      "La administración podrá tener un control total de los residentes, visitantes frecuentes y personal autorizado, con información centralizada y fácil de gestionar.",
      "Se facilita la actualización de datos, reduciendo errores y mejorando la organización interna del conjunto.",
    ],
    icon: "👥",
    cliente: [
      "Registra fácilmente a tu familia, empleados o visitantes frecuentes desde tu usuario.",
      "Evita trámites largos en portería gracias al pre-registro digital que agiliza los accesos.",
    ],
  },
  "Avisos y comunicados": {
    conjunto: [
      "El conjunto dispondrá de un canal centralizado para la publicación de avisos y comunicados oficiales, evitando la dispersión de información.",
      "Se garantiza mayor transparencia en la gestión administrativa y comunicación clara con los residentes.",
    ],
    icon: "📢",
    cliente: [
      "Podrás acceder a comunicados oficiales en cualquier momento desde tu usuario.",
      "Mantente informado de todo lo que ocurre en tu comunidad sin depender de carteleras físicas o reuniones presenciales.",
    ],
  },
  Actividades: {
    conjunto: [
      "El conjunto podrá organizar y difundir actividades comunitarias en un calendario digital accesible para todos.",
      "Esto facilita la participación de los residentes y mejora la integración social dentro de la copropiedad.",
    ],
    icon: "📅",
    cliente: [
      "Podrás conocer, inscribirte y participar en todas las actividades programadas por el conjunto desde tu usuario.",
      "Reserva espacios comunes de manera digital y sin trámites burocráticos.",
    ],
  },
  "Registro de visitantes": {
    conjunto: [
      "La administración podrá llevar un control digital de visitantes en tiempo real, reduciendo los riesgos de seguridad.",
      "Los ingresos quedarán registrados de manera organizada y transparente, lo que permite mayor control desde portería.",
    ],
    icon: "🚪",
    cliente: ["Los accesos serán mucho más seguros."],
  },
  "Registro de residentes": {
    conjunto: [
      "Toda la información de los residentes estará centralizada y actualizada en un sistema digital, lo que mejora la organización y la gestión de la copropiedad.",
      "Se facilita la identificación de residentes autorizados y se evita el uso de registros físicos desactualizados.",
    ],
    icon: "📝",
    cliente: [
      "Podrás mantener actualizados tus datos y los de tu familia de forma sencilla.",
      "Evita inconsistencias en la administración, ya que los registros estarán siempre disponibles y accesibles.",
    ],
  },
  "Página de noticias": {
    conjunto: [
      "El conjunto tendrá un espacio digital oficial donde publicar noticias, proyectos y logros, fortaleciendo la identidad comunitaria.",
      "Se asegura que todos los residentes tengan acceso oportuno y transparente a la información importante.",
    ],
    icon: "📰",
    cliente: [
      "Infórmate de lo que ocurre en tu comunidad directamente desde la aplicación.",
      "Consulta noticias relevantes en cualquier momento.",
    ],
  },
  Marketplace: {
    conjunto: [
      "Se fomenta la economía interna del conjunto, ya que los residentes podrán ofrecer productos o servicios dentro de la plataforma.",
      "Esto genera mayor integración comunitaria y crea oportunidades de crecimiento económico local.",
    ],
    icon: "🛒",
    cliente: [
      "podrás ofrecer productos o servicios con seguridad dentro de tu comunidad.",
      "Apoya a tus vecinos adquiriendo productos y servicios directamente en tu conjunto.",
    ],
  },
  "Control de cartera": {
    conjunto: [
      "La administración podrá automatizar procesos de cobros, pagos y balances financieros, reduciendo el margen de error y mejorando la transparencia.",
      "Los residentes podrán consultar fácilmente estados de cuenta y pagos pendientes, lo que reduce la carga administrativa.",
    ],
    icon: "📊",
    cliente: [
      "Podrás consultar tus pagos y saldos pendientes en cualquier momento desde la aplicación.",
      "Mayor confianza en la gestión económica del conjunto gracias a la transparencia y claridad de los procesos.",
    ],
  },
  "Foro de discusión": {
    conjunto: [
      "El conjunto contará con un espacio digital para debatir y discutir temas de interés común de forma organizada.",
      "Este espacio facilita la toma de decisiones colectivas y promueve la participación activa de los residentes.",
    ],
    icon: "💬",
    cliente: [
      "Podrás expresar tus opiniones, proponer ideas y conocer la opinión de tus vecinos.",
      "Participa en encuestas y votaciones virtuales para que tu voz sea parte de las decisiones del conjunto.",
    ],
  },
  "Gestión documental": {
    conjunto: [
      "Todos los documentos importantes como actas, reglamentos, informes y circulares estarán centralizados en la plataforma.",
      "Se reduce el uso de papel y se facilita el acceso a la información administrativa en cualquier momento.",
    ],
    icon: "📂",
    cliente: [
      "Podrás acceder fácilmente a reglamentos, actas y otros documentos oficiales sin necesidad de solicitarlos presencialmente.",
      "Tendrás a la mano toda la información clave de tu conjunto de manera rápida y segura.",
    ],
  },
  "Gestión de mantenimiento": {
    icon: "🛠️",
    conjunto: [
      "La administración podrá llevar un control organizado y centralizado de los mantenimientos preventivos y correctivos del conjunto, evitando olvidos y retrasos en revisiones obligatorias.",
      "Se generan alertas y registros históricos de cada mantenimiento, lo que facilita auditorías, cumplimiento normativo y una mejor planificación de gastos.",
      "Permite anticiparse a fallas en ascensores, equipos e instalaciones, reduciendo riesgos, costos imprevistos y quejas de los residentes.",
    ],
    cliente: [
      "Como residente tendrás mayor tranquilidad al saber que las áreas comunes y equipos del conjunto reciben mantenimiento oportuno y controlado.",
      "Podrás estar informado sobre revisiones, arreglos y trabajos programados que puedan afectar tu día a día.",
      "Vivirás en un entorno más seguro, funcional y bien cuidado, lo que mejora tu calidad de vida y la valorización de tu propiedad.",
    ],
  },
  "Asamblea y votaciones": {
    icon: "🗳️",
    conjunto: [
      "La administración podrá realizar asambleas y procesos de votación de forma digital, reduciendo costos logísticos y tiempos asociados a reuniones presenciales.",
      "Se garantiza mayor participación de los residentes, ya que pueden votar desde cualquier lugar y en cualquier momento dentro del periodo establecido.",
      "Los resultados se generan de forma automática y transparente, con respaldo digital que evita discusiones o inconsistencias.",
    ],
    cliente: [
      "Podrás participar en las decisiones del conjunto sin necesidad de asistir físicamente a una asamblea.",
      "Tendrás la seguridad de que tu voto queda registrado de manera clara y transparente.",
      "Accede fácilmente a los resultados, encuestas y decisiones tomadas, sintiéndote parte activa de la comunidad.",
    ],
  },

  "Registro de alquileres externos": {
    icon: "🏨",
    conjunto: [
      "La administración podrá llevar un control claro y ordenado de los alquileres temporales realizados a través de plataformas externas como Airbnb o Booking.",
      "Se mejora la seguridad del conjunto al crear accesos temporales y controlados para huéspedes, evitando ingresos no autorizados.",
      "Permite mantener el equilibrio entre la convivencia de los residentes y la actividad de alquiler, reduciendo conflictos y riesgos.",
    ],
    cliente: [
      "Como propietario podrás registrar tus alquileres temporales de forma sencilla y cumplir con las normas del conjunto.",
      "Tus huéspedes contarán con accesos seguros y organizados, mejorando su experiencia sin afectar la tranquilidad de los vecinos.",
      "Tendrás mayor control y respaldo frente a la administración al manejar tus alquileres de manera transparente.",
    ],
  },
};

export default function ModalPlanSummary({
  isOpen,
  onClose,
  title,
  text,
}: Props) {
  const content = contentData[title];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-[1800px] h-auto">
      <div className="p-4 text-center max-h-[70vh] overflow-y-auto">
        {content && <div className="text-5xl mb-4">{content.icon}</div>}
        <Title as="h2" size="md" font="bold">
          {title}
        </Title>
        {content ? (
          <div className="mt-4">
            <Text size="lg" font="bold">
              Beneficios para el conjunto:
            </Text>
            <ul className="list-disc list-inside mb-4 text-center mt-2">
              {content.conjunto.map((item, i) => (
                <li key={i} className="mb-2 text-[20px]">
                  {item}
                </li>
              ))}
            </ul>
            <hr className="my-2" />
            <Text size="lg" font="bold">
              Beneficios para el propietario o residente:
            </Text>
            <ul className="list-disc list-inside text-center mt-2">
              {content.cliente.map((item, i) => (
                <li key={i} className="mb-2 text-[20px]">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <Text>{text}</Text>
        )}
      </div>
    </Modal>
  );
}
