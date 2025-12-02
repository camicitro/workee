package com.example.demo.dtos.seguridad;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UsuarioDTO {
    private String correoUsuario;
    private String contraseniaUsuario;
    private String urlFotoUsuario;
    private String estadoUsuarioInicial;
    private String rolUsuario;
}
