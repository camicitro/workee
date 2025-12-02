package com.example.demo.dtos.busquedas;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UbicacionDTO {
    private Long idProvincia;
    private String nombreProvincia;
    private String nombrePais;
}
