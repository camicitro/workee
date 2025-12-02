package com.example.demo.dtos.metricas.candidato;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EstadisticasCandidatoDTO {
    private Long cantidadPostulacionesEnCurso;
    private Long cantidadPostulacionesRechazadas;
    private List<RubrosDeInteresDTO> rubrosDeInteres;
    private DistribucionPostulacionesPorPaisDTO paisesMasPostulados;
    private List<TopHabilidadDTO> topHabilidadesBlandas;
    private List<TopHabilidadDTO> topHabilidadesTecnicas;
}
