package com.example.demo.dtos.params;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EstadoBusquedaRequestDTO {
    @NotBlank(message = "El nombre del estado de búsqueda no puede estar vacío")
    private String nombreEstadoBusqueda;
}
