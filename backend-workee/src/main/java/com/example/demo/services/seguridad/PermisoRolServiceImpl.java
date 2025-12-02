package com.example.demo.services.seguridad;


import com.example.demo.entities.seguridad.PermisoRol;
import com.example.demo.repositories.seguridad.PermisoRolRepository;
import com.example.demo.services.BaseServiceImpl;


public class PermisoRolServiceImpl extends BaseServiceImpl<PermisoRol, Long> implements PermisoRolService{
    private final PermisoRolRepository permisoRolRepository;

    public PermisoRolServiceImpl(PermisoRolRepository permisoRolRepository){
        super(permisoRolRepository);
        this.permisoRolRepository = permisoRolRepository;
    }

    
}
