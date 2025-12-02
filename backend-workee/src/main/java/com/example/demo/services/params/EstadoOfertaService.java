package com.example.demo.services.params;

import java.util.List;

import com.example.demo.dtos.params.EstadoOfertaRequestDTO;
import com.example.demo.entities.params.EstadoOferta;
import com.example.demo.services.BaseService;

public interface EstadoOfertaService extends BaseService<EstadoOferta, Long> {
    
    EstadoOferta guardarEstadoOferta(EstadoOfertaRequestDTO estadoOfertaDTO);
    
    EstadoOferta actualizarEstadoOferta(Long id, EstadoOfertaRequestDTO estadoOfertaDTO);

    List<EstadoOferta> obtenerEstadoOfertas();
    
    List<EstadoOferta> obtenerEstadoOfertasActivos();

    Boolean habilitarEstadoOferta(Long id);
    
    EstadoOferta findByCodigo(String codigo);

    Boolean deshabilitarEstadoOferta(Long idEstadoOferta);
}