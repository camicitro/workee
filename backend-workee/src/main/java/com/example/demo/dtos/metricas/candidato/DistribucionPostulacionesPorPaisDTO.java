package com.example.demo.dtos.metricas.candidato;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DistribucionPostulacionesPorPaisDTO {
    private Long totalPostulaciones;
    private List<PostulacionesPorPaisDTO> postulaciones;
}
