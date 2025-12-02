package com.example.demo.services.seguridad;

import java.util.List;

import com.example.demo.dtos.seguridad.RolRequestDTO;
import com.example.demo.entities.seguridad.Rol;
import com.example.demo.services.BaseService;

public interface RolService extends BaseService<Rol, Long>{
    public List<Rol> obtenerRoles();
    public Rol crearRol(RolRequestDTO rolRequestDTO);
    public Rol modificarRol(RolRequestDTO rolRequestDTO, Long idRol);
    public Boolean deshabilitarRol(Long idRol);
    public Boolean habilitarRol(Long idRol);

    public List<Rol> obtenerRolesSegunCategoria(Long categoriaRolId);

    public Rol buscarRolActivoPorId(Long idRol);

    public Rol buscarRolPorCodigoRol(String codigoRol);

    public Rol obtenerRolSegunCorreoUsuario(String correo);
}
