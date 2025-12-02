package com.example.demo.repositories.params;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.demo.entities.params.TipoEvento;
import com.example.demo.repositories.BaseRepository;

@Repository
public interface TipoEventoRepository extends BaseRepository<TipoEvento, Long> {
    @Query(value = "SELECT * FROM tipo_evento WHERE fecha_hora_baja IS NULL " + 
            "ORDER BY nombre_tipo_evento ASC", 
            nativeQuery = true
            )
    List<TipoEvento> buscarTiposEventosActivos();

    boolean existsByCodigoTipoEvento(String codigoTipoEvento);

    Optional<TipoEvento> findByNombreTipoEventoIgnoreCase(String NombreTipoEvento);

    List<TipoEvento> findAllByOrderByNombreTipoEventoAsc();
}
