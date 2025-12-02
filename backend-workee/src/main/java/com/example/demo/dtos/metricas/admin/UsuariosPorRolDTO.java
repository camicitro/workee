package com.example.demo.dtos.metricas.admin;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UsuariosPorRolDTO {
    private String nombreRol;
    private String codigoRol;
    private Long cantidadUsuarios;
    private Double porcentajeUsuarios;
}
