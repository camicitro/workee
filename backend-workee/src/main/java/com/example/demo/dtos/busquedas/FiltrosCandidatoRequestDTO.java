package com.example.demo.dtos.busquedas;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FiltrosCandidatoRequestDTO {
    private String nombreCandidato;
    private List<Long> idsProvincias;
    private List<Long> idsPaises;
    private List<Long> idsHabilidades;
    private List<Long> idsEstadosDeBusqueda;
}
