package com.example.demo.dtos.busquedas;

import com.example.demo.entities.empresa.Empresa;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResultadoBusquedaEmpresaDTO {
    private Empresa empresa;
    private Long cantidadOfertasAbiertas;
}
