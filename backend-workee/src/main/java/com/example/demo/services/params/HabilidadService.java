package com.example.demo.services.params;
import com.example.demo.dtos.params.HabilidadRequestDTO;
import com.example.demo.entities.params.Habilidad;
import com.example.demo.services.BaseService;

import java.util.Collection;
import java.util.List;

public interface HabilidadService extends BaseService<Habilidad, Long>{    
    List<Habilidad> findHabilidadByTipoHabilidad(Long idTipoHabilidad);
    
    Habilidad guardarHabilidad(HabilidadRequestDTO habilidadDTO);

    Habilidad actualizarHabilidad(Long id, HabilidadRequestDTO habilidadDTO);

    List<Habilidad> obtenerHabilidades();

    List<Habilidad> obtenerHabilidadesActivas();

    Boolean habilitarHabilidad(Long id);
    
    Boolean deshabilitarHabilidad(Long id);

    List<Habilidad> findAllById(Collection<Long> ids);

}