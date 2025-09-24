"use client";
import { Title, Text } from "complexes-next-components";
import React from "react";

export default function Page() {
  return (
    <div className="p-8">
      <Title size="md" font="bold">
        Términos y Condiciones - Complexes
      </Title>

      <Text font="bold" className="mt-4" size="md">
        1. Aceptación de los Términos
      </Text>
      <Text size="sm">
        Al acceder y utilizar la plataforma Complexes (en adelante), usted
        acepta cumplir con los presentes Términos y Condiciones, así como con
        nuestras Políticas de Privacidad. Si no está de acuerdo, le solicitamos
        no utilizar la Plataforma.
      </Text>

      <Text font="bold" size="md">
        2. Servicios Ofrecidos
      </Text>
      <Text size="sm">
        La Plataforma permite a los usuarios: (i) publicar propiedades para
        arrendamiento, venta o renta vacacional; (ii) registrar conjuntos
        residenciales para gestionar su administración, incluyendo control de
        acceso, residentes y servicios; (iii) facilitar reservas temporales
        dentro de conjuntos o propiedades registradas. Complexes actúa
        únicamente como intermediario tecnológico entre usuarios, residentes,
        propietarios y administraciones.
      </Text>

      <Text font="bold" size="md">
        3. Registro de Usuarios
      </Text>
      <Text size="sm">
        Para utilizar los servicios es necesario crear una cuenta proporcionando
        información veraz, completa y actualizada. El usuario es responsable de
        mantener la confidencialidad de sus credenciales y de todas las
        actividades realizadas en su cuenta. Está prohibido crear cuentas con
        datos falsos o suplantar a terceros.
      </Text>

      <Text font="bold" size="md">
        4. Responsabilidades del Usuario
      </Text>
      <Text size="sm">
        El usuario se compromete a: (i) no publicar información falsa,
        fraudulenta o engañosa; (ii) respetar la legislación aplicable en
        materia de arrendamiento, propiedad horizontal y turismo; (iii)
        garantizar que las reservas realizadas a través de la Plataforma no
        superen los 28 días continuos, a fin de evitar que se configuren
        derechos de arrendatario; (iv) cumplir con el reglamento interno del
        conjunto residencial en el que se encuentre el inmueble.
      </Text>

      <Text font="bold" size="md">
        5. Responsabilidades del Propietario/Anfitrión
      </Text>
      <Text size="sm">
        El propietario o residente que publique un inmueble es el único
        responsable de: (i) la veracidad de la información publicada; (ii)
        garantizar la disponibilidad y condiciones del inmueble; (iii) gestionar
        directamente cualquier incumplimiento del huésped, incluyendo casos en
        los que este no desocupe el inmueble en la fecha pactada. La Plataforma
        no interviene en desalojos ni en procesos judiciales derivados de
        disputas.
      </Text>

      <Text font="bold" size="md">
        6. Uso de la Información
      </Text>
      <Text size="sm">
        El usuario autoriza a la Plataforma a recopilar, almacenar y utilizar la
        información personal y de reservas con fines de operación, seguridad y
        mejora del servicio, de acuerdo con la Política de Privacidad.
      </Text>

      <Text font="bold" size="md">
        7. Limitación de Responsabilidad
      </Text>
      <Text size="sm">
        Complexes actúa únicamente como intermediario y no es parte de los
        contratos de arrendamiento, hospedaje o compraventa entre usuarios. No
        nos hacemos responsables de: (i) disputas entre usuarios; (ii)
        incumplimientos en pagos, salidas o entregas; (iii) ocupaciones
        indebidas por parte de huéspedes. En caso de conflicto, los usuarios
        deberán resolverlo directamente o mediante las autoridades competentes.
      </Text>

      <Text font="bold" size="md">
        8. Tarifas y Pagos
      </Text>
      <Text size="sm">
        Algunos servicios pueden estar sujetos a tarifas. Estas se informarán
        claramente antes de su contratación. Los pagos realizados no son
        reembolsables salvo disposición legal obligatoria en el país
        correspondiente.
      </Text>

      <Text font="bold" size="md">
        9. Derechos de Propiedad Intelectual
      </Text>
      <Text size="sm">
        Todo el contenido, diseño, software y funcionalidades de la Plataforma
        son propiedad exclusiva de Complexes y están protegidos por las leyes de
        propiedad intelectual. El usuario concede a Complexes una licencia no
        exclusiva para mostrar y utilizar el contenido que publique dentro de la
        Plataforma.
      </Text>

      <Text font="bold" size="md">
        10. Cancelación y Suspensión de Cuentas
      </Text>
      <Text size="sm">
        La Plataforma se reserva el derecho de suspender o cancelar cuentas que
        violen estos Términos y Condiciones, sin necesidad de aviso previo.
      </Text>

      <Text font="bold" size="md">
        11. Modificaciones
      </Text>
      <Text size="sm">
        Nos reservamos el derecho de modificar en cualquier momento estos
        Términos y Condiciones. Los cambios serán efectivos desde su publicación
        en la Plataforma.
      </Text>

      <Text font="bold" size="md">
        12. Jurisdicción y Ley Aplicable
      </Text>
      <Text size="sm">
        Estos Términos se interpretarán de acuerdo con la legislación vigente en
        el país donde se ubique la propiedad o conjunto relacionado con la
        disputa. En caso de conflicto, los tribunales competentes serán los de
        dicha jurisdicción.
      </Text>
    </div>
  );
}
