package com.example.demo.dtos.busquedas;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FiltrosEmpresaRequestDTO {
    private String nombreEmpresa;
    private List<Long> idsRubros;
    private List<Long> idsProvincias;
    private Boolean tieneOfertasAbiertas;
}
