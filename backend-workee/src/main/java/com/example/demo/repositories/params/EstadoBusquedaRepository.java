package com.example.demo.repositories.params;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;

import com.example.demo.entities.params.EstadoBusqueda;
import com.example.demo.repositories.BaseRepository;

public interface EstadoBusquedaRepository extends BaseRepository<EstadoBusqueda, Long> {
    
    List<EstadoBusqueda> findAllByOrderByNombreEstadoBusquedaAsc();
    
    @Query(value = "SELECT * FROM estado_busqueda WHERE fecha_hora_baja IS NULL " + 
            "ORDER BY nombre_estado_busqueda ASC", 
            nativeQuery = true)
    List<EstadoBusqueda> buscarEstadosBusquedaActivos();
    
    Optional<EstadoBusqueda> findByNombreEstadoBusquedaIgnoreCase(String nombreEstadoBusqueda);

    boolean existsByCodigoEstadoBusqueda(String codigoEstado);
   
}
