package com.example.demo.dtos.metricas.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UsuariosPorPaisDTO {
    private String nombrePais;
    private Long cantidadUsuarios;
}
