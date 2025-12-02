package com.example.demo.dtos.postulaciones;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OfertasEtapasDTO {
    private Long idOfertaEtapa;
    private Long idEtapa;
    private Integer nroEtapa;
    private String codigoEtapa;
    private String nombreEtapa;
}
