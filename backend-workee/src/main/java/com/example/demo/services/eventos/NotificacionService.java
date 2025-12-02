package com.example.demo.services.eventos;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.example.demo.entities.eventos.Evento;
import com.example.demo.entities.eventos.Notificacion;
import com.example.demo.entities.eventos.TipoNotificacion;
import com.example.demo.entities.postulaciones.PostulacionOferta;
import com.example.demo.entities.seguridad.Usuario;
import com.example.demo.services.BaseService;

public interface NotificacionService extends BaseService<Notificacion, Long> {
    
    Notificacion crearNotificacion(TipoNotificacion tipo, Map<String, Object> datos, Usuario usuarioDestino, Evento eventoRelacionado, LocalDateTime fechaProgramada, PostulacionOferta postulacion);    

    List<Notificacion> obtenerNotificacionesPorUsuario(Long idUsuario);

    List<Notificacion> obtenerNotificacionesPendientesPorUsuario(Long idUsuario);
    
    void marcarComoLeida(Long idNotificacion);

    void marcarComoEnviada(Long idNotificacion);
}