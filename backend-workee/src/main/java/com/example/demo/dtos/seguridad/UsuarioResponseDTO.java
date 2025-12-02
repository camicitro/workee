package com.example.demo.dtos.seguridad;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponseDTO {
    private Long idUsuario;
    private String urlFotoUsuario;
    private String correoUsuario;
    private String rolActualusuario;
    private String nombreEntidad;
    private Long idCategoria;
}
