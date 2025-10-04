"use client";

import React, { useState } from "react";
import { Button, Modal, Text } from "complexes-next-components";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface AccordionItemProps {
  question: string;
  answer: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}
const AccordionItem: React.FC<AccordionItemProps> = ({ question, answer }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <Button
        className="flex w-full items-center justify-between py-3 text-left"
        size="full"
        rounded="lg"
        onClick={() => setOpen(!open)}
      >
        <Text className="font-medium">{question}</Text>
        {open ? <FaChevronUp size={20} /> : <FaChevronDown size={20} />}
      </Button>
      {open && (
        <div className="pb-3 pl-2 m-6">
          <Text className="text-gray-600">{answer}</Text>
        </div>
      )}
    </div>
  );
};

export default function ModalFAQ({ isOpen, onClose }: Props) {
  const faqs = [
    // 💰 Contratación y pagos
    {
      question: "¿Por qué el precio cambia tanto entre los planes?",
      answer:
        "Porque cada plan incluye diferentes funcionalidades y beneficios que se ajustan al tamaño y necesidades de cada conjunto.",
    },
    {
      question: "¿El valor es por conjunto, por torre o por apartamento?",
      answer:
        "El valor se calcula por conjunto, y dentro de cada plan se detalla el costo estimado por inmueble.",
    },
    {
      question: "¿Hay descuentos si pago anual en lugar de mensual?",
      answer:
        "Sí, ofrecemos descuentos para pagos anuales, contáctanos para conocer las promociones vigentes.",
    },
    {
      question:
        "¿El valor de “Total cada inmueble” es obligatorio o solo si uso esa función?",
      answer:
        "Ese valor es una referencia del costo por inmueble, pero no se cobra de manera individual a cada residente.",
    },
    {
      question: "¿Puedo empezar en un plan y luego cambiar a otro?",
      answer:
        "Sí, puedes empezar en un plan y escalar a otro en cualquier momento según tus necesidades.",
    },

    // 🛠 Funcionalidades
    {
      question:
        "En el plan Básico, ¿la citofonía virtual funciona igual que en los otros?",
      answer:
        "Sí, la citofonía virtual está disponible en todos los planes, aunque en los planes Oro y Platino se integra con WhatsApp.",
    },
    {
      question:
        "¿Los registros de visitantes y residentes se hacen en tiempo real?",
      answer:
        "Sí, toda la información se registra y sincroniza en tiempo real.",
    },
    {
      question:
        "¿El “Marketplace de productos y servicios” quién lo administra?",
      answer:
        "Lo administra la comunidad y los residentes, pero la administración puede supervisar y moderar el contenido.",
    },
    {
      question:
        "¿El sistema de contabilidad en el plan Platino reemplaza al software contable del conjunto o solo complementa?",
      answer:
        "Puede complementar o reemplazar, dependiendo de cómo lleven actualmente su contabilidad.",
    },
    {
      question:
        "¿Qué diferencia hay entre “Avisos y comunicados” y la “Página de noticias”?",
      answer:
        "Los avisos y comunicados son mensajes directos a los residentes, mientras que la página de noticias es un espacio de información general.",
    },
    {
      question:
        "En el alquiler vacacional, ¿puedo publicar más inmuebles pagando extra si estoy en el plan Oro?",
      answer:
        "Sí, puedes ampliar la cantidad de inmuebles disponibles pagando un costo adicional.",
    },

    // 📱 Uso de la aplicación
    {
      question: "¿Se necesita capacitación para los administradores?",
      answer:
        "No, la app es intuitiva, pero ofrecemos capacitación gratuita si se requiere.",
    },
    {
      question: "¿La app funciona en cualquier celular o solo en Android/iOS?",
      answer: "Funciona en Android, iOS y también desde navegador web.",
    },
    {
      question:
        "¿Se puede integrar con cámaras de seguridad o solo es registro manual?",
      answer:
        "Por defecto es registro manual, pero ofrecemos integraciones personalizadas con sistemas de cámaras.",
    },
    {
      question: "¿Hay límite de residentes que se pueden registrar?",
      answer: "No, puedes registrar la cantidad de residentes que necesites.",
    },
    {
      question: "¿Qué pasa con los datos si dejo de pagar el servicio?",
      answer:
        "Tus datos se mantienen en nuestra base por un tiempo, para que puedas reactivar el servicio sin pérdida de información.",
    },

    // 🔒 Seguridad y soporte
    {
      question: "¿Cómo protegen la información de residentes y visitantes?",
      answer:
        "Usamos servidores seguros en la nube, encriptación de datos y protocolos de seguridad certificados.",
    },
    {
      question: "¿Hay soporte técnico 24/7 o solo en horario laboral?",
      answer:
        "El soporte básico es en horario laboral, mientras que en planes superiores se ofrece soporte extendido.",
    },
    {
      question: "¿Dónde se almacenan los datos?",
      answer:
        "En servidores en la nube con estándares internacionales de seguridad.",
    },

    // 💳 Pagos extra
    {
      question: "¿Puedo probar la plataforma gratis antes de pagar?",
      answer: "No, prueba gratuita no ofrecemos.",
    },
    {
      question: "¿Puedo pagar solo por algunos módulos?",
      answer:
        "No, los módulos se incluyen según cada plan, pero puedes elegir el plan que más se ajuste a tus necesidades.",
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer:
        "Aceptamos tarjeta de crédito, débito, PSE y transferencias bancarias.",
    },
    {
      question: "¿El precio incluye IVA?",
      answer: "Sí, los precios publicados incluyen IVA.",
    },
    {
      question: "¿Qué pasa si me atraso en el pago?",
      answer:
        "Tendrás un periodo de gracia y luego el acceso se suspende hasta que regularices el pago.",
    },

    // 🎨 Personalización
    {
      question: "¿Se pueden personalizar los módulos con el logo o colores?",
      answer:
        "Sí, la aplicación permite personalizar imagen y colores institucionales.",
    },
    {
      question: "¿Se pueden crear roles diferentes además de subusuarios?",
      answer: "Sí, contamos con roles de administrador, vigilante y residente.",
    },
    {
      question: "¿Puedo activar o desactivar funciones según mis necesidades?",
      answer: "Sí, puedes habilitar solo lo que necesites.",
    },
    {
      question: "¿Puedo aumentar el número de inmuebles si mi conjunto crece?",
      answer: "Sí, puedes solicitar ampliaciones pagando un valor adicional.",
    },

    // 🔗 Integraciones
    {
      question: "¿Se puede conectar con control de acceso?",
      answer: "Sí, ofrecemos integración con hardware compatible.",
    },
    {
      question: "¿La citofonía funciona con fijos o celulares?",
      answer: "Funciona con celulares mediante WhatsApp o llamadas VoIP.",
    },
    {
      question: "¿Se puede enviar notificaciones push?",
      answer: "Sí, vía app, correo y WhatsApp.",
    },

    // 👥 Experiencia de usuario
    {
      question: "¿Los residentes deben descargar la app?",
      answer: "Sí, disponible en iOS, Android y web.",
    },
    {
      question: "¿El vigilante necesita internet constante?",
      answer:
        "Sí, aunque si se pierde conexión los datos se guardan y sincronizan luego.",
    },
    {
      question: "¿Se puede usar en varios idiomas?",
      answer:
        "Por defecto está en español, pero podemos habilitar inglés si se requiere.",
    },
    {
      question: "¿Cuántos dispositivos pueden usar la misma cuenta?",
      answer:
        "Cada usuario puede tener la app en máximo 2 dispositivos a la vez.",
    },
    {
      question: "¿Qué tan fácil es migrar información de otro sistema?",
      answer: "Muy fácil, te ayudamos a importar tus datos actuales.",
    },

    // 📞 Soporte y garantías
    {
      question: "¿Qué soporte incluyen los planes?",
      answer:
        "Soporte en línea en todos los planes, y soporte telefónico prioritario en Oro y Platino.",
    },
    {
      question: "¿Hay contrato mínimo de permanencia?",
      answer: "No, puedes cancelar cuando quieras sin penalización.",
    },
    {
      question: "¿Las actualizaciones tienen costo adicional?",
      answer: "No, todas las actualizaciones están incluidas en tu plan.",
    },
    {
      question: "¿Tienen póliza de cumplimiento?",
      answer: "Sí, garantizamos continuidad y seguridad del servicio.",
    },

    // 🎯 Beneficios prácticos
    {
      question:
        "¿Qué diferencia real voy a sentir entre el plan Básico y el Oro?",
      answer:
        "El plan Oro ofrece más usuarios, avisos/comunicados y marketplace, mejorando la interacción y gestión.",
    },
    {
      question: "¿Vale la pena el Platino si mi conjunto es pequeño?",
      answer:
        "Generalmente el Platino es para conjuntos grandes. Si el tuyo es pequeño, puedes empezar con Básico u Oro.",
    },
    {
      question: "¿Qué ejemplos de otros conjuntos ya lo están usando?",
      answer:
        "Trabajamos con conjuntos en varias ciudades, podemos compartir casos de éxito.",
    },
    {
      question: "¿Qué ahorro se logra usando la app?",
      answer:
        "Reducción en costos de administración, ahorro de tiempo en registros y mejor comunicación con los residentes.",
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="w-[800px]"
      title="Preguntas frecuentes"
    >
      <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
        {faqs.map((faq, idx) => (
          <AccordionItem key={idx} {...faq} />
        ))}
      </div>
    </Modal>
  );
}
