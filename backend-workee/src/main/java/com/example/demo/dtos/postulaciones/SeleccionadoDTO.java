package com.example.demo.dtos.postulaciones;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SeleccionadoDTO {
    private Boolean soloEste;
    private String retroalimenetacion;
}
