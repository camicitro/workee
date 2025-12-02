package com.example.demo.repositories.params;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;

import com.example.demo.entities.params.ModalidadOferta;
import com.example.demo.repositories.BaseRepository;

public interface ModalidadOfertaRepository extends BaseRepository<ModalidadOferta, Long> {
    List<ModalidadOferta> findAllByOrderByNombreModalidadOfertaAsc();
    
    @Query(value = "SELECT * FROM modalidad_oferta WHERE fecha_hora_baja IS NULL " + 
            "ORDER BY nombre_modalidad_oferta ASC", 
            nativeQuery = true)
    List<ModalidadOferta> buscarModalidadOfertasActivos();

    Optional<ModalidadOferta> findByNombreModalidadOfertaIgnoreCase(String nombreModalidadOferta);
}
