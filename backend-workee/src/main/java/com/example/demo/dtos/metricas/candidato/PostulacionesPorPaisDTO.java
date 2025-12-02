package com.example.demo.dtos.metricas.candidato;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostulacionesPorPaisDTO {
    private String nombrePais;
    private Long cantidad;
    private Double porcentajePostulaciones;
}
