package com.example.demo.repositories.seguridad;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.example.demo.entities.seguridad.CategoriaRol;
import com.example.demo.repositories.BaseRepository;

@Repository
public interface CategoriaRolRepository extends BaseRepository<CategoriaRol, Long>{
    public List<CategoriaRol> findAllByFechaHoraBajaIsNullOrderByNombreCategoriaRolAsc();
}
