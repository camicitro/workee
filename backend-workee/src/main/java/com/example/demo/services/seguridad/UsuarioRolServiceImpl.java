package com.example.demo.services.seguridad;

import org.springframework.stereotype.Service;

import com.example.demo.entities.seguridad.UsuarioRol;
import com.example.demo.repositories.seguridad.UsuarioRolRepository;
import com.example.demo.services.BaseServiceImpl;

@Service
public class UsuarioRolServiceImpl extends BaseServiceImpl<UsuarioRol, Long> implements UsuarioRolService {
    private final UsuarioRolRepository usuarioRolRepository;

    public UsuarioRolServiceImpl(UsuarioRolRepository usuarioRolRepository){
        super(usuarioRolRepository);
        this.usuarioRolRepository = usuarioRolRepository;
    }

    @Override
    public Boolean existenUsuariosActivosUsandoRol(Long idRol){
        return usuarioRolRepository.existenUsuariosActivosConRol(idRol);
    }
}
