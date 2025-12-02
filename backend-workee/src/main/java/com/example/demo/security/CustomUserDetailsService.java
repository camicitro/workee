package com.example.demo.security;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.demo.entities.seguridad.PermisoRol;
import com.example.demo.entities.seguridad.Usuario;
import com.example.demo.entities.seguridad.UsuarioRol;
import com.example.demo.exceptions.EntityNotFoundException;
import com.example.demo.repositories.seguridad.PermisoRolRepository;
import com.example.demo.repositories.seguridad.UsuarioRepository;
import com.example.demo.repositories.seguridad.UsuarioRolRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService{

    private final UsuarioRepository usuarioRepository;
    private final UsuarioRolRepository usuarioRolRepository;
    private final PermisoRolRepository permisoRolRepository;

    public CustomUserDetailsService(UsuarioRepository usuarioRepository, UsuarioRolRepository usuarioRolRepository, PermisoRolRepository permisoRolRepository){
        this.usuarioRepository = usuarioRepository;
        this.usuarioRolRepository = usuarioRolRepository;
        this.permisoRolRepository = permisoRolRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String correoUsuario) throws UsernameNotFoundException {
        Optional<Usuario> usuarioOptional = usuarioRepository.buscarUsuarioPorCorreo(correoUsuario);
        if(!usuarioOptional.isPresent()){
            throw new EntityNotFoundException("No se encontró ningún usuario activo con el correo ingresado");
        }
        Usuario usuario = usuarioOptional.get();
                

        Optional<UsuarioRol> usuarioRolOptional = usuarioRolRepository.buscarUsuarioRolActualSegunIdUsuario(usuario.getId());
        if(!usuarioRolOptional.isPresent()){
            throw new EntityNotFoundException("No se encontró el rol actual del usuario");
        }
        UsuarioRol usuarioRol = usuarioRolOptional.get();
        List<PermisoRol> permisosDelRol = permisoRolRepository.buscarPermisosActivosPorRol(usuarioRol.getRol().getId());
        if(permisosDelRol == null || permisosDelRol.isEmpty()){
            throw new EntityNotFoundException("No se encontraron permisos asociados al rol indicado");
        }


        List<GrantedAuthority> authorities = permisosDelRol.stream()
            .map(permisoRol -> new SimpleGrantedAuthority(permisoRol.getPermiso().getCodigoPermiso())) 
            .collect(Collectors.toList());  

        
        return new org.springframework.security.core.userdetails.User(
                usuario.getCorreoUsuario(),
                usuario.getContraseniaUsuario(),
                authorities
        );
    }

}
