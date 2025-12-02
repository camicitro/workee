package com.example.demo.repositories.params;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;

import com.example.demo.entities.params.Rubro;
import com.example.demo.repositories.BaseRepository;

public interface RubroRepository extends BaseRepository<Rubro, Long> {
    
    List<Rubro> findAllByOrderByNombreRubroAsc();

    @Query(value = "SELECT * FROM rubro WHERE fecha_hora_baja IS NULL " + 
            "ORDER BY nombre_rubro ASC", 
            nativeQuery = true)
    List<Rubro> buscarRubrosActivos();

    Optional<Rubro> findByNombreRubroIgnoreCase(String nombreRubro);
    
}
