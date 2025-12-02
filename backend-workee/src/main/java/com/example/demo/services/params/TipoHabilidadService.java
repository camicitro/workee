package com.example.demo.services.params;

import java.util.List;

import com.example.demo.dtos.params.TipoHabilidadRequestDTO;
import com.example.demo.entities.params.TipoHabilidad;
import com.example.demo.services.BaseService;

public interface TipoHabilidadService extends BaseService<TipoHabilidad, Long> {
    
    TipoHabilidad guardarTipoHabilidad(TipoHabilidadRequestDTO tipoHabilidadDTO);
    
    TipoHabilidad actualizarTipoHabilidad(Long id, TipoHabilidadRequestDTO tipoHabilidadDTO);

    List<TipoHabilidad> obtenerTipoHabilidades();
    
    List<TipoHabilidad> obtenerTipoHabilidadesActivos();

    Boolean habilitarTipoHabilidad(Long id);
    
    Boolean deshabilitarTipoHabilidad(Long id);
    
} 
