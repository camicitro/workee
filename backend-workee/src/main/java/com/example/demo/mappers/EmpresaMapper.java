package com.example.demo.mappers;

import org.mapstruct.*;

import com.example.demo.dtos.empresa.EmpresaRequestDTO;
import com.example.demo.entities.empresa.Empresa;

@Mapper(componentModel = "spring") 
public interface EmpresaMapper {
    
    // Para creación
    @Mapping(target = "provincia", ignore = true)
    @Mapping(target = "rubro", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    Empresa toEntity(EmpresaRequestDTO dto);

    // Para actualización parcial (omite campos nulos)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "provincia", ignore = true)
    @Mapping(target = "rubro", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "fechaHoraAlta", ignore = true)
    @Mapping(target = "fechaHoraBaja", ignore = true)
    @Mapping(target = "id", ignore = true)
    void updateEntityFromDto(EmpresaRequestDTO dto, @MappingTarget Empresa entity);
}