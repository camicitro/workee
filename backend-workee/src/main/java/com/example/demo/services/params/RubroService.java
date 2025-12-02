package com.example.demo.services.params;

import java.util.List;

import com.example.demo.dtos.params.RubroRequestDTO;
import com.example.demo.entities.params.Rubro;
import com.example.demo.services.BaseService;

public interface RubroService extends BaseService<Rubro, Long> {
    Rubro guardarRubro(RubroRequestDTO rubroDTO);

    Rubro actualizarRubro(Long id, RubroRequestDTO rubroDTO);

    List<Rubro> obtenerRubros();

    List<Rubro> obtenerRubrosActivos();

    Boolean habilitarRubro(Long id);

    public Boolean deshabilitarRubro(Long idRubro);
    
}
