package com.example.demo.repositories.params;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.demo.entities.params.TipoHabilidad;
import com.example.demo.repositories.BaseRepository;

@Repository
public interface TipoHabilidadRepository extends BaseRepository<TipoHabilidad, Long> {    
    
     List<TipoHabilidad> findAllByOrderByNombreTipoHabilidadAsc();
    
    @Query(value = "SELECT * FROM tipo_habilidad WHERE fecha_hora_baja IS NULL " + 
            "ORDER BY nombre_tipo_habilidad ASC", 
            nativeQuery = true)
     List<TipoHabilidad> buscarTipoHabilidadesActivos(); 
    
    Optional<TipoHabilidad> findByNombreTipoHabilidadIgnoreCase(String nombreTipoHabilidad); 

    boolean existsByCodigoTipoHabilidad(String codigoTipoHabilidad);
    
} 