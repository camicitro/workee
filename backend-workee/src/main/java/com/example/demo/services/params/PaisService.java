        package com.example.demo.services.params;

import java.util.List;

import com.example.demo.dtos.params.PaisRequestDTO;
import com.example.demo.entities.params.Pais;
import com.example.demo.services.BaseService;

public interface PaisService extends BaseService<Pais, Long> {
    public Pais guardarPais(PaisRequestDTO paisRequestDTO);

    public Pais actualizarPais(Long id, PaisRequestDTO paisRequestDTO);

    public List<Pais> obtenerPaises();

    public List<Pais> obtenerPaisesActivos();

    public Boolean habilitarPais(Long id);

    public Boolean deshabilitarPais(Long idPais);

}
