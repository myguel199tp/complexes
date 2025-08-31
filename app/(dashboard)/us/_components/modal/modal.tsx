import { Modal, Text } from "complexes-next-components";
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
      "El conjunto tendrá una herramienta de gestión optimizada para las reservas de apartamentos que se alquilan de manera temporal, facilitando la organización de ocupación, limpieza y mantenimiento.",
      "Podrá controlar mejor la entrada y salida de visitantes, garantizando que los alquileres no afecten la seguridad ni la convivencia de los residentes.",
      "El modelo de negocio incluye un beneficio económico voluntario para el conjunto: si el apartamento pertenece a la copropiedad, recibe un 3% adicional; si es externo, un 2%. Esto se suma como ingreso comunitario sin generar costos adicionales.",
    ],
    icon: "🏖️",
    cliente: [
      "Como anfitrión recibirás siempre el 85% de la tarifa establecida, asegurando que la mayor parte de la ganancia sea tuya.",
      "La plataforma cobra un 15% por la gestión tecnológica, publicidad y soporte. De ese porcentaje, un beneficio voluntario se destina al conjunto (3% si es interno y 2% si es externo), lo que fortalece la comunidad sin reducir tus ingresos.",
      "Podrás gestionar tus reservas de manera sencilla, confirmar o cancelar con pocos clics y tener trazabilidad de cada operación.",
      "Los huéspedes disfrutarán de un proceso de reserva confiable, transparente y con el respaldo del conjunto, lo que genera mayor confianza y fidelización.",
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
      "Registra fácilmente a tu familia, empleados o visitantes frecuentes desde tu celular.",
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
      "Podrás acceder a comunicados oficiales en cualquier momento desde tu celular.",
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
      "Podrás conocer, inscribirte y participar en todas las actividades programadas por el conjunto desde tu celular.",
      "Reserva espacios comunes de manera digital y sin trámites burocráticos.",
    ],
  },
  "Registro de visitantes": {
    conjunto: [
      "La administración podrá llevar un control digital de visitantes en tiempo real, reduciendo los riesgos de seguridad.",
      "Los ingresos quedarán registrados de manera organizada y transparente, lo que permite mayor control desde portería.",
    ],
    icon: "🚪",
    cliente: [
      "Podrás registrar a tus visitantes con antelación para agilizar su ingreso al conjunto.",
      "Los accesos serán mucho más rápidos y seguros, evitando filas y confusiones en portería.",
    ],
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
      "Consulta noticias relevantes en cualquier momento, sin depender de terceros.",
    ],
  },
  Marketplace: {
    conjunto: [
      "Se fomenta la economía interna del conjunto, ya que los residentes podrán ofrecer productos o servicios dentro de la plataforma.",
      "Esto genera mayor integración comunitaria y crea oportunidades de crecimiento económico local.",
    ],
    icon: "🛒",
    cliente: [
      "Podrás comprar y vender con seguridad dentro de tu comunidad, evitando riesgos de plataformas externas.",
      "Apoya a tus vecinos adquiriendo productos y servicios directamente en tu conjunto.",
    ],
  },
  "Sistema contable": {
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
};

export default function ModalPlanSummary({
  isOpen,
  onClose,
  title,
  text,
}: Props) {
  const content = contentData[title];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 text-center max-h-[70vh] overflow-y-auto">
        {content && (
          <div className="text-5xl mb-4">{content.icon}</div> // Muestra el icono
        )}
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        {content ? (
          <>
            <Text size="sm" font="bold">
              Beneficios para el conjunto:
            </Text>
            <ul className="list-disc list-inside mb-4 text-left">
              {content.conjunto.map((item, i) => (
                <li key={i} className="mb-2">
                  {item}
                </li>
              ))}
            </ul>
            <Text className="font-semibold">
              Beneficios para el propietario o residente:
            </Text>
            <ul className="list-disc list-inside text-left">
              {content.cliente.map((item, i) => (
                <li key={i} className="mb-2">
                  {item}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <Text>{text}</Text>
        )}
      </div>
    </Modal>
  );
}
