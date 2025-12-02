package com.example.demo.repositories.params;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;

import com.example.demo.entities.params.EstadoOferta;
import com.example.demo.repositories.BaseRepository;

public interface EstadoOfertaRepository extends BaseRepository<EstadoOferta, Long> {    
    List<EstadoOferta> findAllByOrderByNombreEstadoOfertaAsc();

    @Query(value = "SELECT * FROM estado_oferta WHERE fecha_hora_baja IS NULL " + 
            "ORDER BY nombre_estado_oferta ASC", 
            nativeQuery = true)
    List<EstadoOferta> buscarEstadoOfertasActivos();
    
    Optional<EstadoOferta> findByNombreEstadoOfertaIgnoreCase(String nombreEstadoOferta);

    Optional<EstadoOferta> findByCodigo(String codigo);    
} 
