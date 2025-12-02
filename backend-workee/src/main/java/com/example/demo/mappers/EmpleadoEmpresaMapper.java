package com.example.demo.mappers;
 
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.example.demo.dtos.empresa.EmpleadoEmpresaRequestDTO;
import com.example.demo.entities.empresa.EmpleadoEmpresa;

@Mapper(componentModel = "spring")
public interface EmpleadoEmpresaMapper {
       
    //Para creacion
    @Mapping(target = "empresa", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    EmpleadoEmpresa toEntity(EmpleadoEmpresaRequestDTO dto);

    //Para modificacion
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "fechaHoraAlta", ignore = true)
    @Mapping(target = "fechaHoraBaja", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "empresa", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    void updateEntityFromDto(EmpleadoEmpresaRequestDTO dto, @MappingTarget EmpleadoEmpresa entity);
    
}
 