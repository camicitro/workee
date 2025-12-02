package com.example.demo.repositories.candidato;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entities.candidato.Candidato;
import com.example.demo.repositories.BaseRepository;

@Repository
public interface CandidatoRepository extends BaseRepository<Candidato, Long> {
    
    List<Candidato> findAllByOrderByNombreCandidatoAsc();
    
    //@Query("SELECT c FROM Candidato c LEFT JOIN FETCH c.habilidades ch LEFT JOIN FETCH ch.habilidad WHERE c.id = :id")
    @Query("""
        SELECT DISTINCT c
        FROM Candidato c
        LEFT JOIN FETCH c.habilidades ch
        LEFT JOIN FETCH ch.habilidad h
        LEFT JOIN FETCH h.tipoHabilidad
        WHERE c.id = :id
        """)
    Optional<Candidato> findByIdWithHabilidades(@Param("id") Long id);

    boolean existsByGeneroIdAndFechaHoraBajaIsNull(Long generoId);

    boolean existsByProvincia_Pais_IdAndFechaHoraBajaIsNull(Long idPais);

    boolean existsByProvinciaIdAndFechaHoraBajaIsNull(Long idProvincia);

    boolean existsByEstadoBusquedaIdAndFechaHoraBajaIsNull(Long estadoBusquedaId);

    boolean existsByHabilidades_Habilidad_IdAndFechaHoraBajaIsNull(Long habilidadId);

    boolean existsByHabilidades_Habilidad_TipoHabilidad_IdAndFechaHoraBajaIsNull(long tipoHabilidadId);
    

    @Query(
        value = "SELECT * FROM candidato c " + 
                "WHERE (LOWER(c.nombre_candidato) LIKE LOWER(CONCAT('%', :nombreCandidato, '%')) ) " + 
                "AND c.fecha_hora_baja IS NULL",
        nativeQuery = true
    )
    public List<Candidato> buscarCandidatosPorNombre(@Param("nombreCandidato") String nombreCandidato);


    @Query(
        """
            SELECT DISTINCT c FROM Candidato c
            LEFT JOIN c.habilidades ch
            LEFT JOIN ch.habilidad h
            LEFT JOIN c.provincia p
            WHERE (:nombreCandidato IS NULL OR LOWER(CONCAT(c.nombreCandidato, ' ', c.apellidoCandidato)) LIKE LOWER(CONCAT('%', :nombreCandidato, '%'))) 
            AND (:idsEstadosBusqueda IS NULL OR c.estadoBusqueda.id IN :idsEstadosBusqueda)
            AND (:idsProvincias IS NULL OR c.provincia.id IN :idsProvincias)
            AND (:idsPaises IS NULL OR p.pais.id IN :idsPaises)
            AND ch.fechaHoraBaja IS NULL
            AND (:idsHabilidades IS NULL OR h.id IN :idsHabilidades)
            AND c.fechaHoraBaja IS NULL
        """
    )
    public List<Candidato> buscarCandidatosConFiltros(@Param("nombreCandidato") String nombreCandidato, @Param("idsHabilidades") List<Long> idsHabilidades, @Param("idsProvincias") List<Long> idsProvincias, @Param("idsPaises") List<Long> idsPaises, @Param("idsEstadosBusqueda") List<Long> idsEstadosBusqueda);


    Optional<Candidato> findByUsuarioId(Long usuarioId);

    Boolean existsByUsuarioId(Long usuarioId);
}
