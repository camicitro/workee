package com.example.demo.repositories.params;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.demo.entities.params.Pais;
import com.example.demo.repositories.BaseRepository;

@Repository
public interface PaisRepository extends BaseRepository<Pais, Long> {

    @Query(value = "SELECT * FROM pais WHERE fecha_hora_baja IS NULL " + 
            "ORDER BY nombre_pais ASC", 
            nativeQuery = true
            )
    List<Pais> buscarPaisesActivos();

    Optional<Pais> findByNombrePaisIgnoreCase(String nombrePais);

    List<Pais> findAllByOrderByNombrePaisAsc();
}
