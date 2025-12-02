package com.example.demo.repositories.params;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.dtos.busquedas.UbicacionDTO;
import com.example.demo.entities.params.Provincia;
import com.example.demo.repositories.BaseRepository;

@Repository
public interface ProvinciaRepository extends BaseRepository<Provincia, Long> {
    
        @Query(
                value = "SELECT * FROM provincia p WHERE p.id_pais = :idPais " + 
                        "ORDER BY p.nombre_provincia ASC ",
                nativeQuery = true
        )
        List<Provincia> findProvinciaByPaisId(@Param("idPais") Long idPais);

        @Query(value = "SELECT * FROM provincia WHERE fecha_hora_baja IS NULL " + 
                "ORDER BY nombre_provincia ASC", 
                nativeQuery = true
                )
        List<Provincia> buscarProvinciasActivas();

        List<Provincia> findAllByOrderByNombreProvinciaAsc();

    Optional<Provincia> findByNombreProvinciaIgnoreCase(String nombreProvincia);


    //use JPQL porque era mas facil mapear al DTO
    @Query("""
            SELECT new com.example.demo.dtos.busquedas.UbicacionDTO(p.id, p.nombreProvincia, pais.nombrePais)
            FROM Provincia p
            JOIN p.pais 
            WHERE p.fechaHoraBaja IS NULL AND pais.fechaHoraBaja IS NULL
            GROUP BY p.id, p.nombreProvincia, pais.nombrePais
            ORDER BY pais.nombrePais ASC, p.nombreProvincia ASC
            """
    )
    List<UbicacionDTO> obtenerUbicaciones();


    @Query(
        value = "SELECT * FROM provincia p WHERE p.id_pais = :idPais AND p.fecha_hora_baja IS NULL " + 
                "ORDER BY p.nombre_provincia ASC ",
        nativeQuery = true
        )
        List<Provincia> findProvinciasActivasByPaisId(@Param("idPais") Long idPais);
}
