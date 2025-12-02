package com.example.demo.dtos.metricas.candidato;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RubrosDeInteresDTO {
    private String nombreRubro;
    private Long cantidadPostulaciones;
}
