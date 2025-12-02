package com.example.demo.dtos.metricas.empresa;

import com.example.demo.dtos.metricas.candidato.DistribucionPostulacionesPorPaisDTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EstadisticasEmpresaDTO {
    private Long cantidadOfertasAbiertas;
    private DistribucionGenerosDTO distribucionGeneros;
    private Double tasaAbandono;
    private Double tiempoPromedioContratacion;
    private DistribucionPostulacionesPorPaisDTO distribucionPostulacionesPorPais;
}
