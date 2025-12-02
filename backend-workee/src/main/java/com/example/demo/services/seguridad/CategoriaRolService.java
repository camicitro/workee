package com.example.demo.services.seguridad;

import java.util.List;

import com.example.demo.entities.seguridad.CategoriaRol;
import com.example.demo.services.BaseService;

public interface CategoriaRolService extends BaseService<CategoriaRol, Long>{
    public List<CategoriaRol> obtenerCategoriasRoles();
}
