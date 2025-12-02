package com.example.demo.repositories.params;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;

import com.example.demo.entities.params.Etapa;
import com.example.demo.repositories.BaseRepository;

public interface EtapaRepository extends BaseRepository<Etapa, Long> {
    
    List<Etapa> findAllByOrderByNombreEtapaAsc();

    @Query(value = "SELECT * FROM etapa WHERE fecha_hora_baja IS NULL " + 
            "ORDER BY nombre_etapa ASC", 
            nativeQuery = true)
    List<Etapa> buscarEtapasActivos();

    Optional<Etapa> findByNombreEtapaIgnoreCase(String nombreEtapa);
    
    boolean existsByNombreEtapaIgnoreCaseAndEmpresaIdAndEsPredeterminadaFalse(String nombreEtapa, Long empresaId);

    // disponibles = predeterminadas activas + propias activas de la empresa
    @Query("""
        SELECT e FROM Etapa e
        WHERE e.fechaHoraBaja IS NULL
        AND (e.esPredeterminada = true OR e.empresa.id = :empresaId)
        ORDER BY e.esPredeterminada ASC, e.nombreEtapa ASC
    """)
    List<Etapa> findDisponiblesParaEmpresa(Long empresaId);

    List<Etapa> findAllByIdIn(Collection<Long> ids);

    @Query("""
            SELECT e FROM Etapa e
            WHERE e.fechaHoraBaja IS NULL
                AND e.esPredeterminada = false 
                AND e.empresa.id = :empresaId
            ORDER BY e.nombreEtapa ASC
            """)
    List<Etapa> findPropiasActivas(Long empresaId);

    Optional<Etapa> findByIdAndEmpresaIdAndFechaHoraBajaIsNull(Long idEtapa, Long empresaId);

    boolean existsByCodigoEtapa(String codigoEtapa);
    Optional<Etapa> findByCodigoEtapaIgnoreCaseAndEsPredeterminadaAndEmpresaIsNull(String nombreEtapa, boolean esPredeterminada);

    Etapa findByCodigoEtapaAndFechaHoraBajaIsNull(String codigoEtapa);
}
