package com.example.demo.dtos.params;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HabilidadRequestDTO {
    @NotBlank(message = "El nombre de la habilidad no puede estar vacío")
    private String nombreHabilidad;

    @NotNull(message = "El ID del tipo de habilidad no puede ser nulo")
    private Long idTipoHabilidad;
}
