package com.example.demo.services.oferta;

import java.util.List;

import com.example.demo.dtos.ofertas.OfertaEtapaRequestDTO;
import com.example.demo.entities.oferta.OfertaEtapa;
import com.example.demo.services.BaseService;

public interface OfertaEtapaService extends BaseService<OfertaEtapa, Long> {
    List<OfertaEtapa> crearOfertaEtapasDesdeDto(Long empresaId, List<OfertaEtapaRequestDTO> dtos);
    OfertaEtapa crearEtapaPredeterminada(String nombre, int numeroEtapa);
}
