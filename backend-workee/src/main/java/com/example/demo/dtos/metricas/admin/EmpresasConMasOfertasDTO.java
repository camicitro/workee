package com.example.demo.dtos.metricas.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmpresasConMasOfertasDTO {
    private String nombreEmpresa;
    private Long cantidadOfertas;
}
