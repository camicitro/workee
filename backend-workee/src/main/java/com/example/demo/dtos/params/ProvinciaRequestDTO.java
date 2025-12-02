package com.example.demo.dtos.params;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProvinciaRequestDTO {
    @NotBlank(message = "El nombre de la provincia no puede estar vacío")
    private String nombreProvincia;

    @NotNull(message = "El ID del país no puede ser nulo")
    private Long idPais;
}
