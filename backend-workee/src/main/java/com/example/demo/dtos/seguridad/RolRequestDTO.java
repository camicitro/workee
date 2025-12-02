package com.example.demo.dtos.seguridad;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RolRequestDTO {
    @NotBlank(message = "El nombre del rol es obligatorio")
    private String nombreRol;

    @NotNull(message = "La categoría es obligatoria")
    private Long idCategoria;

    @Size(min = 1, message = "Debe seleccionar al menos un permiso")
    @NotNull(message = "La lista de permisos no puede estar vacía")
    private List<Long> idPermisos; 
}
