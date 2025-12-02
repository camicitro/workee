package com.example.demo.services.seguridad;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.entities.seguridad.Permiso;
import com.example.demo.repositories.seguridad.PermisoRepository;
import com.example.demo.services.BaseServiceImpl;

@Service
public class PermisoServiceImpl extends BaseServiceImpl<Permiso, Long> implements PermisoService{
    private PermisoRepository permisoRepository;

    public PermisoServiceImpl(PermisoRepository permisoRepository){
        super(permisoRepository);
        this.permisoRepository = permisoRepository;
    }

    @Override
    public List<Permiso> obtenerPermisosDeUnaCategoria(Long idCategoria){
        return permisoRepository.buscarPermisosPorCategoria(idCategoria);
    }

    @Override
    public List<Permiso> obtenerPermisosDeUnRol(Long idRol){
        return permisoRepository.buscarPermisosPorRol(idRol);
    }

    @Override
    public List<Permiso> obtenerPermisosActivos(){
        return permisoRepository.buscarPermisosActivos();
    }

    @Override
    public List<Permiso> obtenerPermisos(){
        return permisoRepository.findByFechaHoraBajaIsNull();
    }

}
