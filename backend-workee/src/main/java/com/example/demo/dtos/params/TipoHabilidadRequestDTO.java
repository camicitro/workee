package com.example.demo.dtos.params;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TipoHabilidadRequestDTO {
    @NotBlank(message = "El nombre del tipo de habilidad no puede estar vacío")
    private String nombreTipoHabilidad; 
}
