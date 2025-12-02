package com.example.demo.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
 
import com.example.demo.dtos.seguridad.UsuarioDTO;
import com.example.demo.entities.seguridad.Usuario;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {
   
    //@Mapping(target = "urlFotoUsuario", ignore = true)
    @Mapping(target = "usuarioEstadoList", ignore = true)
    Usuario toEntity(UsuarioDTO dto);
}
