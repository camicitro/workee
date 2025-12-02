package com.example.demo.dtos.metricas.empresa;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GenerosPostuladosDTO {
    private String nombreGenero;
    private Long cantidadCandidatosPostulados;
    private Double porcentajePostulaciones;
}
