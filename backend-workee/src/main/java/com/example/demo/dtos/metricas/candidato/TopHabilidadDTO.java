package com.example.demo.dtos.metricas.candidato;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopHabilidadDTO {
    private String nombreHabilidad;
    private Long cantidad;
}
