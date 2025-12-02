package com.example.demo.repositories.params;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.demo.entities.params.Genero;
import com.example.demo.repositories.BaseRepository;

@Repository
public interface GeneroRepository extends BaseRepository<Genero, Long> {
    
    @Query(value = "SELECT * FROM genero WHERE fecha_hora_baja IS NULL " + 
            "ORDER BY nombre_genero ASC", 
            nativeQuery = true
            )
    List<Genero> buscarGenerosActivos();

    Optional<Genero> findByNombreGeneroIgnoreCase(String nombreGenero);

    List<Genero> findAllByOrderByNombreGeneroAsc();
}
