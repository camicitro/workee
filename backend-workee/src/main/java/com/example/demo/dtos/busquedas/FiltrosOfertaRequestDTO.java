package com.example.demo.dtos.busquedas;
import java.util.List;

import com.example.demo.entities.oferta.FechaFiltroOfertaEnum;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FiltrosOfertaRequestDTO {
    private String nombreOferta;
    private List<Long> idsProvincias;
    private List<Long> idsTipoContrato;
    private List<Long> idsModalidadOferta;
    private  FechaFiltroOfertaEnum fechaFiltro;
}
