package com.example.demo.dtos.metricas.empresa;

import java.util.List;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DistribucionGenerosDTO {
    private Long totalPostulaciones;
    private List<GenerosPostuladosDTO> postulaciones;
}
