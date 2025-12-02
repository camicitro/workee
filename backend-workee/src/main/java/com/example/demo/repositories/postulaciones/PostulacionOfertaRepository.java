package com.example.demo.repositories.postulaciones;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.dtos.metricas.candidato.PostulacionesPorPaisDTO;
import com.example.demo.dtos.metricas.candidato.RubrosDeInteresDTO;
import com.example.demo.dtos.metricas.empresa.GenerosPostuladosDTO;
import com.example.demo.dtos.ofertas.CandidatoPostuladoDTO;
import com.example.demo.dtos.postulaciones.EtapaActualPostulacionDTO;
import com.example.demo.entities.params.Etapa;
import com.example.demo.entities.postulaciones.PostulacionOferta;
import com.example.demo.repositories.BaseRepository;

@Repository
public interface PostulacionOfertaRepository extends BaseRepository<PostulacionOferta, Long> {

    //public Optional<PostulacionOferta> findByCandidatoIdAndOfertaIdAndFechaHoraFinPostulacionOfertaIsNull(Long idCandidato, Long idOferta);
    
    @Query(
        """
              SELECT po FROM PostulacionOferta po
              JOIN po.postulacionOfertaEtapaList poe
              JOIN poe.etapa e
              WHERE po.candidato.id = :idCandidato AND po.oferta.id = :idOferta
              AND po.fechaHoraFinPostulacionOferta IS NULL AND po.fechaHoraAbandonoOferta IS NULL
              AND poe.fechaHoraBaja IS NULL AND e.codigoEtapa NOT IN ('ABANDONADO', 'RECHAZADO', 'SELECCIONADO', 'NO_ACEPTADO') 
        """
    )
    public Optional<PostulacionOferta> buscarPostulacionEnCurso(@Param("idCandidato") Long idCandidato, @Param("idOferta") Long idOferta);

    public List<PostulacionOferta> findByCandidatoIdOrderByFechaHoraAltaDesc(Long idCandidato);


    @Query("""
        SELECT DISTINCT new com.example.demo.dtos.postulaciones.EtapaActualPostulacionDTO(
            e.codigoEtapa, e.nombreEtapa
        )
        FROM PostulacionOferta po
        JOIN po.postulacionOfertaEtapaList poe
        JOIN poe.etapa e
        WHERE po.candidato.id = :idCandidato
        AND poe.fechaHoraBaja IS NULL
    """)
    List<EtapaActualPostulacionDTO> findEtapasActualesByCandidato(@Param("idCandidato") Long idCandidato);
    

     @Query("""
        SELECT DISTINCT new com.example.demo.dtos.ofertas.CandidatoPostuladoDTO(
            po.id,
            po.candidato.id, po.candidato.nombreCandidato, 
            po.candidato.apellidoCandidato, po.fechaHoraAlta, 
            e.codigoEtapa, e.nombreEtapa,
            u.urlFotoUsuario
        )
        FROM PostulacionOferta po
        JOIN po.postulacionOfertaEtapaList poe
        JOIN poe.etapa e
        JOIN po.candidato c
        JOIN c.usuario u
        WHERE po.oferta.id = :idOferta
        AND poe.fechaHoraBaja IS NULL
        AND e.codigoEtapa NOT IN ('PENDIENTE')
    """)
    List<CandidatoPostuladoDTO> traerCandidatosPostulados(@Param("idOferta") Long idOferta); //Trae todos los postulados excepto los pendientes

    @Query("""
        SELECT DISTINCT new com.example.demo.dtos.ofertas.CandidatoPostuladoDTO(
            po.id,
            po.candidato.id, po.candidato.nombreCandidato, 
            po.candidato.apellidoCandidato, po.fechaHoraAlta, 
            e.codigoEtapa, e.nombreEtapa,
            u.urlFotoUsuario
        )
        FROM PostulacionOferta po
        JOIN po.postulacionOfertaEtapaList poe
        JOIN poe.etapa e
        JOIN po.candidato c
        JOIN c.usuario u
        WHERE po.oferta.id = :idOferta
        AND poe.fechaHoraBaja IS NULL
        AND e.codigoEtapa LIKE '%PENDIENTE%'
        AND po.idIniciadorPostulacion <> :idEmpresa
    """)
    List<CandidatoPostuladoDTO> traerCandidatosPostuladosPendientes(@Param("idOferta") Long idOferta, @Param("idEmpresa") Long idEmpresa); //Trae solo los postulados pendientes

    @Query("""
        SELECT DISTINCT new com.example.demo.dtos.ofertas.CandidatoPostuladoDTO(
            po.id,
            po.candidato.id, po.candidato.nombreCandidato, 
            po.candidato.apellidoCandidato, po.fechaHoraAlta, 
            e.codigoEtapa, e.nombreEtapa,
            u.urlFotoUsuario
        )
        FROM PostulacionOferta po
        JOIN po.postulacionOfertaEtapaList poe
        JOIN poe.etapa e
        JOIN po.candidato c
        JOIN c.usuario u
        WHERE po.oferta.id = :idOferta
        AND poe.fechaHoraBaja IS NULL
        AND e.codigoEtapa LIKE '%PENDIENTE%'
        AND po.idIniciadorPostulacion = :idEmpresa
    """)
    List<CandidatoPostuladoDTO> traerCandidatosSolicitadaSuParticipacionPendientes(@Param("idOferta") Long idOferta, @Param("idEmpresa") Long idEmpresa); //Trae solo los postulados pendientes

    @Query("""
        SELECT DISTINCT po
        FROM PostulacionOferta po
        JOIN po.postulacionOfertaEtapaList poe
        JOIN poe.etapa e
        WHERE po.oferta.id = :idOferta
        AND poe.fechaHoraBaja IS NULL
        AND e.codigoEtapa NOT IN ('ABANDONADO', 'RECHAZADO', 'SELECCIONADO', 'NO_ACEPTADO')
    """)
    List<PostulacionOferta> traerPostulacionesCandidatosEnCurso(@Param("idOferta") Long idOferta); 


     @Query("""
        SELECT DISTINCT new com.example.demo.dtos.ofertas.CandidatoPostuladoDTO(
            po.id,
            po.candidato.id, po.candidato.nombreCandidato, 
            po.candidato.apellidoCandidato, po.fechaHoraAlta, 
            e.codigoEtapa, e.nombreEtapa,
            u.urlFotoUsuario
        )
        FROM PostulacionOferta po
        JOIN po.postulacionOfertaEtapaList poe
        JOIN poe.etapa e
        JOIN po.candidato c
        JOIN c.usuario u
        WHERE po.oferta.id = :idOferta
        AND poe.fechaHoraBaja IS NULL
        AND e.codigoEtapa LIKE '%SELECCIONADO%'
    """)
    List<CandidatoPostuladoDTO> traerCandidatosSeleccionados(@Param("idOferta") Long idOferta); //Trae todos los candidatos seleccionados. Solo esos


    @Query(
        """
           SELECT e FROM PostulacionOferta p
           JOIN p.postulacionOfertaEtapaList poe
           JOIN poe.etapa e
           WHERE p.oferta.id = :idOferta AND p.candidato.id = :idCandidato
           AND poe.fechaHoraBaja IS NULL
           AND p.fechaHoraFinPostulacionOferta IS NULL AND p.fechaHoraAbandonoOferta IS NULL
        """
    )
    Optional<Etapa> traerEtapaActualDePostulacionCandidato(@Param("idOferta") Long idOferta, @Param("idCandidato") Long idCandidato);
    
    @Query("""
    SELECT po
    FROM PostulacionOferta po
    JOIN po.postulacionOfertaEtapaList poe
    WHERE poe.id = :idEtapa
    """)
    Optional<PostulacionOferta> findByEtapaId(@Param("idEtapa") Long idEtapa);



    @Query(
        """
              SELECT COUNT(po) FROM PostulacionOferta po
              JOIN po.postulacionOfertaEtapaList poe
              JOIN poe.etapa e
              WHERE po.candidato.id = :idCandidato 
              AND po.fechaHoraFinPostulacionOferta IS NULL AND po.fechaHoraAbandonoOferta IS NULL
              AND poe.fechaHoraBaja IS NULL AND e.codigoEtapa NOT IN ('ABANDONADO', 'RECHAZADO', 'SELECCIONADO', 'NO_ACEPTADO') 
        """
    )
    public Long traerCantidadPostulacionesEnCurso(@Param("idCandidato") Long idCandidato);


    @Query(
        """
              SELECT COUNT(po) FROM PostulacionOferta po
              JOIN po.postulacionOfertaEtapaList poe
              JOIN poe.etapa e
              WHERE po.candidato.id = :idCandidato
              AND po.fechaHoraFinPostulacionOferta IS NOT NULL
              AND po.fechaHoraFinPostulacionOferta BETWEEN :desde AND :hasta
              AND poe.fechaHoraBaja IS NULL AND e.codigoEtapa LIKE 'RECHAZADO'
        """
    )
    public Long traerCantidadPostulacionesRechazadas(@Param("idCandidato") Long idCandidato, @Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);


    @Query(
        """
              SELECT new com.example.demo.dtos.metricas.candidato.RubrosDeInteresDTO(r.nombreRubro, COUNT(po))
              FROM PostulacionOferta po
              JOIN po.oferta o
              JOIN o.empresa e
              JOIN e.rubro r
              WHERE po.candidato.id = :idCandidato
              AND po.fechaHoraAlta BETWEEN :desde AND :hasta
              GROUP BY r.nombreRubro
              ORDER BY COUNT(po) DESC
        """
    )
    public List<RubrosDeInteresDTO> traerRubrosDeInteres(@Param("idCandidato") Long idCandidato, @Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);

    @Query(
        """
              SELECT new com.example.demo.dtos.metricas.candidato.PostulacionesPorPaisDTO(pa.nombrePais, COUNT(po), 0.0)
              FROM PostulacionOferta po
              JOIN po.oferta o
              JOIN o.empresa e
              JOIN e.provincia pr
              JOIN pr.pais pa
              WHERE po.candidato.id = :idCandidato
              AND po.fechaHoraAlta BETWEEN :desde AND :hasta
              GROUP BY pa.nombrePais
              ORDER BY COUNT(po) DESC
        """
    )
    public List<PostulacionesPorPaisDTO> postulacionesPorPais(@Param("idCandidato") Long idCandidato, @Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);

    @Query("""
        SELECT  new com.example.demo.dtos.metricas.empresa.GenerosPostuladosDTO(g.nombreGenero, COUNT(DISTINCT c), 0.0)
        FROM PostulacionOferta p
        JOIN p.candidato c
        JOIN c.genero g
        JOIN p.oferta o
        WHERE o.empresa.id = :empresaId
        AND p.fechaHoraAlta BETWEEN :desde AND :hasta
        GROUP BY g.nombreGenero
    """)
    List<GenerosPostuladosDTO> distribucionGenerosPorEmpresa(@Param("empresaId") Long empresaId, @Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);

    @Query("""
            SELECT 
                COALESCE(SUM(CASE WHEN p.fechaHoraAbandonoOferta IS NOT NULL THEN 1 ELSE 0 END), 0),
                COUNT(p)
            FROM PostulacionOferta p
            JOIN p.oferta o
            WHERE o.empresa.id = :empresaId
            AND p.fechaHoraAlta BETWEEN :fechaDesde AND :fechaHasta
        """)
    List<Object[]> abandonoVsTotal(@Param("empresaId") Long empresaId,@Param("fechaDesde") LocalDateTime fechaDesde, @Param("fechaHasta") LocalDateTime fechaHasta);

    @Query("""
        SELECT COALESCE(AVG(TIMESTAMPDIFF(SECOND, p.fechaHoraAlta, p.fechaHoraFinPostulacionOferta) / 86400.0), 0)
        FROM PostulacionOferta p
        JOIN p.postulacionOfertaEtapaList poe
        JOIN p.oferta o
        JOIN poe.etapa e
        WHERE o.empresa.id = :empresaId
        AND p.fechaHoraFinPostulacionOferta IS NOT NULL
        AND p.fechaHoraFinPostulacionOferta BETWEEN :fechaDesde AND :fechaHasta
        AND poe.fechaHoraBaja IS NULL AND e.codigoEtapa LIKE 'SELECCIONADO'
    """)
    Double tiempoPromedioContratacion(@Param("empresaId") Long empresaId, @Param("fechaDesde") LocalDateTime fechaDesde, @Param("fechaHasta") LocalDateTime fechaHasta);
    
    @Query(
        """
              SELECT new com.example.demo.dtos.metricas.candidato.PostulacionesPorPaisDTO(pa.nombrePais, COUNT(DISTINCT c), 0.0)
              FROM PostulacionOferta po
              JOIN po.candidato c
              JOIN po.oferta o
              JOIN o.empresa e
              JOIN c.provincia pr
              JOIN pr.pais pa
              WHERE e.id = :idEmpresa
              AND po.fechaHoraAlta BETWEEN :desde AND :hasta
              GROUP BY pa.nombrePais
              ORDER BY COUNT(po) DESC
        """
    )
    public List<PostulacionesPorPaisDTO> localizacionCandidatos(@Param("idEmpresa") Long idEmpresa, @Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);

    @Query(
        value = "SELECT po.id " +
                "FROM notificacion n " +
                "JOIN evento e ON n.id_evento = e.id " +
                "JOIN postulacion_oferta_etapa poe ON e.id_postulacion_oferta_etapa = poe.id " +
                "JOIN postulacion_oferta po ON poe.id_postulacion_oferta = po.id " +
                "WHERE n.id = :notificacionId",
        nativeQuery = true
    )
    Long findPostulacionOfertaIdByNotificacionId(@Param("notificacionId") Long notificacionId);

    @Query(
        value = "SELECT n.id_postulacion " +
                "FROM notificacion n " +
                "WHERE n.id = :notificacionId",
        nativeQuery = true
    )
    Long findPostulacionOfertaIdByNotificacionId2(@Param("notificacionId") Long notificacionId);

}