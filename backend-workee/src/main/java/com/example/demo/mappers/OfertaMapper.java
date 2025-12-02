package com.example.demo.mappers;

import org.mapstruct.*;

import com.example.demo.dtos.ofertas.OfertaRequestDTO;
import com.example.demo.entities.oferta.Oferta; 

//MapStruct genera automáticamente la implementación de este mapper en tiempo de compilación
@Mapper(componentModel = "spring") //se registra como un bean de Spring
public interface OfertaMapper {
     
    @BeanMapping(ignoreByDefault = true) // Ignora todos los campos que no estén explícitamente configurados
    @Mapping(target = "titulo", source = "titulo") // Copia el campo "titulo" del DTO al campo "titulo" 
    @Mapping(target = "descripcion", source = "descripcion") // Copia "descripción"
    @Mapping(target = "responsabilidades", source = "responsabilidades") // Copia "responsabilidades"
    // // Relaciones y valores que se setean en el Service (no desde el DTO)
    @Mapping(target = "empresa", ignore = true)
    @Mapping(target = "modalidadOferta", ignore = true)
    @Mapping(target = "tipoContratoOferta", ignore = true)
    @Mapping(target = "habilidades", ignore = true)
    @Mapping(target = "estadosOferta", ignore = true)
    @Mapping(target = "ofertaEtapas", ignore = true)
    @Mapping(target = "finalizadaConExito", ignore = true)
    @Mapping(target = "fechaFinalizacion", ignore = true)
    Oferta toEntity(OfertaRequestDTO dto);
}
 