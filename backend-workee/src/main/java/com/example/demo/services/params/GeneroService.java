package com.example.demo.services.params;
import java.util.List;

import com.example.demo.dtos.params.GeneroRequestDTO;
import com.example.demo.entities.params.Genero;
import com.example.demo.services.BaseService;

public interface GeneroService extends BaseService<Genero, Long>{
    Genero guardarGenero(GeneroRequestDTO GeneroRequestDTO);

    Genero actualizarGenero(Long id, GeneroRequestDTO GeneroRequestDTO);

    List<Genero> obtenerGeneros();

    List<Genero> obtenerGenerosActivos();

    Boolean habilitarGenero(Long id);

    Boolean deshabilitarGenero(Long id);
}
