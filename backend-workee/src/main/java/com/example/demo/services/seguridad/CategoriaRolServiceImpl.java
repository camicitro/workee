package com.example.demo.services.seguridad;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.entities.seguridad.CategoriaRol;
import com.example.demo.repositories.seguridad.CategoriaRolRepository;
import com.example.demo.services.BaseServiceImpl;

@Service
public class CategoriaRolServiceImpl extends BaseServiceImpl<CategoriaRol, Long> implements CategoriaRolService{
    private final CategoriaRolRepository categoriaRolRepository;

    public CategoriaRolServiceImpl(CategoriaRolRepository categoriaRolRepository){
        super(categoriaRolRepository);
        this.categoriaRolRepository = categoriaRolRepository;
    }

    @Override
    public List<CategoriaRol> obtenerCategoriasRoles(){
        return categoriaRolRepository.findAllByFechaHoraBajaIsNullOrderByNombreCategoriaRolAsc();
    }

}
