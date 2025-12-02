package com.example.demo.mappers;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.example.demo.dtos.candidato.CandidatoRequestDTO;
import com.example.demo.entities.candidato.Candidato;

@Mapper(componentModel = "spring")
public interface CandidatoMapper {
   
    // Mapea todos los atributos salvo los que se setean manualmente
    @Mapping(target = "provincia", ignore = true)
    @Mapping(target = "genero", ignore = true)
    @Mapping(target = "estadoBusqueda", ignore = true)
    @Mapping(target = "habilidades", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "candidatoCV", ignore = true)
    Candidato toEntity(CandidatoRequestDTO dto);

    // Mapea actualización parcial, ignorando los atributos que se setean manualmente
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "provincia", ignore = true)
    @Mapping(target = "genero", ignore = true)
    @Mapping(target = "estadoBusqueda", ignore = true)
    @Mapping(target = "habilidades", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "fechaHoraBaja", ignore = true)
    @Mapping(target = "fechaHoraAlta", ignore = true)
    @Mapping(target = "candidatoCV", ignore = true)
    Candidato updateEntityFromDto(CandidatoRequestDTO dto, @MappingTarget Candidato entity);
} 