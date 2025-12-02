
package com.example.demo.repositories.oferta;

import org.springframework.stereotype.Repository;

import com.example.demo.entities.oferta.OfertaEstadoOferta;
import com.example.demo.repositories.BaseRepository;

@Repository
public interface OfertaEstadoOfertaRepository extends BaseRepository<OfertaEstadoOferta, Long> {
    // Define any additional methods specific to OfertaEstadoOferta if needed
    Boolean existsByEstadoOfertaIdAndFechaHoraBajaIsNull(Long estadoOfertaId);  
}
