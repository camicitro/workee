package com.example.demo.repositories.eventos;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.entities.eventos.Evento;
import com.example.demo.repositories.BaseRepository;

public interface EventoRepository extends BaseRepository<Evento, Long>{
    @Query("""
    SELECT e FROM Evento e
    WHERE e.fechaHoraBaja IS NULL
      AND (e.usuarioCandidato.id = :idUsuario OR e.usuarioEmpleado.id = :idUsuario)
    """)
    List<Evento> findEventosActivosPorUsuario(@Param("idUsuario") Long idUsuario);

    @Query("""
        SELECT e FROM Evento e
        JOIN EmpleadoEmpresa ee ON e.usuarioEmpleado.id = ee.usuario.id
        WHERE ee.empresa.id = :idEmpresa
        AND e.fechaHoraBaja IS NULL
    """)
    List<Evento> findEventosByEmpresaIdAndFechaHoraBajaIsNull(@Param("idEmpresa") Long idEmpresa);

    @Query("""
    SELECT e FROM Evento e
    WHERE e.fechaHoraBaja IS NULL
      AND e.fechaHoraInicioEvento BETWEEN :desde AND :hasta
    """)
    List<Evento> findEventosEntreFechasAndFechaHoraBajaIsNull(@Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);

    @Query("""
    SELECT e FROM Evento e
    WHERE e.fechaHoraBaja IS NULL
      AND e.postulacionOfertaEtapa.id IN :idsEtapas
    """)
    List<Evento> findEventosActivosPorEtapas(@Param("idsEtapas") List<Long> idsEtapas);

}
