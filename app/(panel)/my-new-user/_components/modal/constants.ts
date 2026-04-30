export enum CertificateType {
  PAZ_Y_SALVO_ADMINISTRACION = "Paz y salvo de administración",
  PAZ_Y_SALVO_CUOTAS_EXTRAORDINARIAS = "Paz y salvo por cuotas extraordinarias",
  PAZ_Y_SALVO_INTERESES_SANCIONES = "Paz y salvo por intereses o sanciones",
  PAZ_Y_SALVO_PARQUEADERO = "Paz y salvo por parqueadero",
  PAZ_Y_SALVO_ARRENDAMIENTO = "Paz y salvo por arrendamiento",
  PAZ_Y_SALVO_GENERAL = "Paz y salvo general",
  PAZ_Y_SALVO_SERVICIOS_COMUNES = "Paz y salvo por servicios comunes",
  PAZ_Y_SALVO_ENTREGA_INMUEBLE = "Paz y salvo por entrega de inmueble",
  CERTIFICADO_RESIDENCIA = "Certificado de residencia",
  CERTIFICADO_VECINDAD = "Certificado de vecindad",
  CERTIFICADO_ARRENDAMIENTO = "Certificado de arrendamiento",
  CERTIFICADO_TENENCIA = "Certificado de tenencia",
  CERTIFICADO_ENTREGA_INMUEBLE = "Certificado de entrega del inmueble",
  CERTIFICADO_NO_SANCIONES = "Certificado de no sanciones",
  CERTIFICADO_BUEN_COMPORTAMIENTO = "Certificado de buen comportamiento",
  CERTIFICADO_CUMPLIMIENTO_REGLAMENTO = "Certificado de cumplimiento del reglamento interno",
  CERTIFICADO_PROPIEDAD_POSESION = "Certificado de propiedad o posesión",
  CERTIFICADO_VENTA_INMUEBLE = "Certificado para venta de inmueble",
  CERTIFICADO_DEUDA = "Certificado de deuda",
  CERTIFICADO_PARTICIPACION_ASAMBLEAS = "Certificado de participación en asambleas",
  CERTIFICADO_COEFICIENTE_COPROPIEDAD = "Certificado de participación porcentual (coeficiente de copropiedad)",
  CERTIFICADO_ACTUALIZACION_DATOS = "Certificado de actualización de datos",
  CONSTANCIA_MANTENIMIENTO_REVISION = "Constancia de mantenimiento o revisión técnica",
  CERTIFICADO_USO_DESTINACION = "Certificado de uso o destinación",
  CERTIFICADO_CONVIVENCIA = "Certificado de convivencia",
  OTRO = "otro",
}

export const defaultCertificateDescriptions: Record<CertificateType, string> = {
  [CertificateType.PAZ_Y_SALVO_ADMINISTRACION]:
    "Certifica que el propietario se encuentra al día con los pagos de administración.",
  [CertificateType.PAZ_Y_SALVO_CUOTAS_EXTRAORDINARIAS]:
    "Certifica que no presenta deudas por cuotas extraordinarias.",
  [CertificateType.PAZ_Y_SALVO_INTERESES_SANCIONES]:
    "Certifica que no existen intereses o sanciones pendientes.",
  [CertificateType.PAZ_Y_SALVO_PARQUEADERO]:
    "Certifica que el propietario se encuentra al día con los pagos relacionados al parqueadero.",
  [CertificateType.PAZ_Y_SALVO_ARRENDAMIENTO]:
    "Certifica que el arrendatario se encuentra al día con los pagos de arrendamiento.",
  [CertificateType.PAZ_Y_SALVO_GENERAL]:
    "Certifica que no existen deudas pendientes con la copropiedad.",
  [CertificateType.PAZ_Y_SALVO_SERVICIOS_COMUNES]:
    "Certifica que el propietario ha cumplido con los pagos de los servicios comunes.",
  [CertificateType.PAZ_Y_SALVO_ENTREGA_INMUEBLE]:
    "Certifica que el inmueble ha sido entregado a satisfacción y sin deudas.",
  [CertificateType.CERTIFICADO_RESIDENCIA]:
    "Certifica que el residente habita de manera permanente en el conjunto.",
  [CertificateType.CERTIFICADO_VECINDAD]:
    "Certifica que el propietario o residente pertenece a esta comunidad de vecinos.",
  [CertificateType.CERTIFICADO_ARRENDAMIENTO]:
    "Certifica la relación de arrendamiento vigente del inmueble.",
  [CertificateType.CERTIFICADO_TENENCIA]:
    "Certifica la tenencia legal y actual del inmueble.",
  [CertificateType.CERTIFICADO_ENTREGA_INMUEBLE]:
    "Certifica que el inmueble fue entregado conforme a lo establecido.",
  [CertificateType.CERTIFICADO_NO_SANCIONES]:
    "Certifica que el propietario no registra sanciones en la copropiedad.",
  [CertificateType.CERTIFICADO_BUEN_COMPORTAMIENTO]:
    "Certifica el buen comportamiento del residente dentro del conjunto.",
  [CertificateType.CERTIFICADO_CUMPLIMIENTO_REGLAMENTO]:
    "Certifica que el propietario cumple con el reglamento interno.",
  [CertificateType.CERTIFICADO_PROPIEDAD_POSESION]:
    "Certifica la propiedad o posesión legal del inmueble.",
  [CertificateType.CERTIFICADO_VENTA_INMUEBLE]:
    "Certifica el estado del inmueble para fines de venta.",
  [CertificateType.CERTIFICADO_DEUDA]:
    "Certifica el saldo pendiente o las deudas existentes con la copropiedad.",
  [CertificateType.CERTIFICADO_PARTICIPACION_ASAMBLEAS]:
    "Certifica la participación del propietario en las asambleas del conjunto.",
  [CertificateType.CERTIFICADO_COEFICIENTE_COPROPIEDAD]:
    "Certifica el porcentaje de participación del propietario en la copropiedad.",
  [CertificateType.CERTIFICADO_ACTUALIZACION_DATOS]:
    "Certifica la actualización de la información personal y del inmueble.",
  [CertificateType.CONSTANCIA_MANTENIMIENTO_REVISION]:
    "Certifica que se ha realizado el mantenimiento o revisión técnica correspondiente.",
  [CertificateType.CERTIFICADO_USO_DESTINACION]:
    "Certifica el uso o destinación actual del inmueble.",
  [CertificateType.CERTIFICADO_CONVIVENCIA]:
    "Certifica la buena convivencia y armonía del residente dentro del conjunto.",
  [CertificateType.OTRO]:
    "Certificación generada por solicitud especial no contemplada en los tipos anteriores.",
};
