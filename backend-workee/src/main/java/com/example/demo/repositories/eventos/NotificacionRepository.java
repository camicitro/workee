package com.example.demo.repositories.eventos;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entities.eventos.Notificacion;
import com.example.demo.repositories.BaseRepository;

@Repository
public interface NotificacionRepository extends BaseRepository<Notificacion, Long> {
    @Query("""
        SELECT n
        FROM Notificacion n
        WHERE n.usuario.id = :idUsuario
        AND n.enviada = true
        AND n.fechaHoraEnvioNotificacion <= :ahora
        AND n.fechaHoraBaja IS NULL
        ORDER BY n.fechaHoraEnvioNotificacion DESC
    """)
    List<Notificacion> findEnviadasPorUsuario(@Param("idUsuario") Long idUsuario, @Param("ahora") LocalDateTime ahora);

    @Query("""
        SELECT n 
        FROM Notificacion n 
        WHERE n.usuario.id = :idUsuario 
            AND n.fechaHoraBaja IS NULL 
            AND n.enviada = false 
            AND n.fechaHoraEnvioNotificacion <= :ahora
        ORDER BY n.fechaHoraEnvioNotificacion DESC
    """)
    List<Notificacion> findPendientesPorUsuario(@Param("idUsuario") Long idUsuario, @Param("ahora") LocalDateTime ahora);

    // Notificaciones pendientes (a mostrar)
    List<Notificacion> findByUsuarioIdAndEnviadaFalseAndFechaHoraEnvioNotificacionBeforeAndFechaHoraBajaIsNullOrderByFechaHoraEnvioNotificacionAsc(
    Long idUsuario,
    LocalDateTime fechaActual
    );
    
    // Todas las notificaciones del usuario (para el listado)
    List<Notificacion> findByUsuarioIdAndFechaHoraBajaIsNullOrderByFechaHoraEnvioNotificacionDesc(Long idUsuario);
}


