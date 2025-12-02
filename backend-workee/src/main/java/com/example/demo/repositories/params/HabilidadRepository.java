package com.example.demo.repositories.params;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.demo.entities.params.Habilidad;
import com.example.demo.repositories.BaseRepository;

@Repository
public interface HabilidadRepository extends BaseRepository<Habilidad, Long> {
    
    List<Habilidad> findByTipoHabilidadId(Long idTipoHabilidad);
    
    @Query(value = "SELECT * FROM habilidad WHERE fecha_hora_baja IS NULL " + 
            "ORDER BY nombre_habilidad ASC", 
            nativeQuery = true)
    List<Habilidad> buscarHabilidadesActivas();

    Optional<Habilidad> findByNombreHabilidadIgnoreCase(String nombreHabilidad);
    
    List<Habilidad> findAllByOrderByNombreHabilidadAsc();

    List<Habilidad> findAllByIdIn(Collection<Long> ids);

}
