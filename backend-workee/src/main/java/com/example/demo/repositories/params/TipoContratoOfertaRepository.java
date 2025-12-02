package com.example.demo.repositories.params;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.demo.entities.params.TipoContratoOferta;
import com.example.demo.repositories.BaseRepository;

@Repository
public interface TipoContratoOfertaRepository extends BaseRepository<TipoContratoOferta, Long> {
    @Query(value = "SELECT * FROM tipo_contrato_oferta WHERE fecha_hora_baja IS NULL " + 
            "ORDER BY nombre_tipo_contrato_oferta ASC", 
            nativeQuery = true
            )
    List<TipoContratoOferta> buscarTiposContratosOfertaActivos();

    Optional<TipoContratoOferta> findByNombreTipoContratoOfertaIgnoreCase(String nombreTipoContratoOferta);

    List<TipoContratoOferta> findAllByOrderByNombreTipoContratoOfertaAsc();
}
