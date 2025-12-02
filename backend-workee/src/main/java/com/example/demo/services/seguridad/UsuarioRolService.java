package com.example.demo.services.seguridad;

import com.example.demo.entities.seguridad.UsuarioRol;
import com.example.demo.services.BaseService;

public interface UsuarioRolService extends BaseService<UsuarioRol, Long>{
    public Boolean existenUsuariosActivosUsandoRol(Long idRol);
}
