package com.example.demo.entities.eventos;

public enum TipoNotificacion {
    // Postulaciones
    SOLICITUD_POSTULACION_OFERTA_ACEPTADA(
        "¡Tu solicitud de postulación ha sido aceptada!",
        "Tu postulación solicitada el día {fecha} ha sido aceptada. Ahora estás participando para el puesto {oferta} en {empresa}."
    ),

    CAMBIO_ETAPA_POSTULACION(
    "Actualización de postulación",
    "Tu postulación para {oferta} en {empresa} ha cambiado a la etapa {etapa}."
    ),

    // Invitaciones
    INVITACION_OFERTA(
        "¡Han solicitado tu participación en una oferta!",
        "La empresa {empresa} ha solicitado tu participación en la oferta de {oferta}."
    ),

    CANDIDATO_SELECCIONADO(
        "¡Has sido seleccionado!",
        "¡Felicidades! Has sido seleccionado para el puesto de {oferta} en {empresa}."
    ),
    
    CANDIDATO_RECHAZADO(
        "Tu postulación ha sido rechazada",
        "Lamentablemente, tu postulación para {oferta} en {empresa} ha sido rechazada."
    ),

    // Eventos / Recordatorios
    EVENTO_ENTREGA(
        "Nueva entrega",
        "Tienes una nueva entrega para la empresa {empresa} en la oferta {oferta}, programada para el {fecha} a las {horas}."
    ),

    EVENTO_VIDEOLLAMADA(
        "Nueva videollamada",
        "Tienes una nueva videollamada con {empresa} para la oferta {oferta} el día {fecha} a las {horas}."
    ),

    EVENTO_ELIMINADO(
        "Tu evento ha sido eliminado",
        "El evento {titulo} para el puesto de {oferta} en {empresa} ha sido eliminado."
    ),

    EVENTO_MODIFICADO(
        "Tu evento ha sido modificado",
        "El evento {titulo} para el puesto de {oferta} en {empresa} ha sido modificado. Está programado para el día {fecha} a las {horas}."
    ),
    
    RECORDATORIO_EVENTO_3_DIAS_CANDIDATO(
        "Recordatorio de evento",
        "Tu evento {titulo} con {empresa} está programado para el día {fecha} a las {horas}."
    ),
    RECORDATORIO_EVENTO_1_DIA_CANDIDATO(
        "Recordatorio de evento",
        "Tu evento {titulo} con {empresa} está programado para mañana a las {horas}."
    ),

    RECORDATORIO_EVENTO_3_DIAS_EMPRESA(
        "Recordatorio de evento",
        "Tu evento {titulo} con {candidato} para el puesto {oferta} está programado para el día {fecha} a las {horas}."
    ),

    RECORDATORIO_EVENTO_1_DIA_EMPRESA(
        "Recordatorio de evento",
        "Tu evento {titulo} con {candidato} para el puesto {oferta} está programado para mañana a las {horas}."
    );

    private final String titulo;
    private final String template;

    TipoNotificacion(String titulo, String template) {
        this.titulo = titulo;
        this.template = template;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getTemplate() {
        return template;
    }


}
