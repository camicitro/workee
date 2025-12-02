package com.example.demo.dtos.seguridad;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ActualizarContraseniaDTO {
    private String contraseniaActual;
    private String contraseniaNueva;
    private String repetirContrasenia;
}
