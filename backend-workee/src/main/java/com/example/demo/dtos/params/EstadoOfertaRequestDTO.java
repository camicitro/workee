package com.example.demo.dtos.params;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EstadoOfertaRequestDTO {
    @NotBlank(message = "El nombre del estado de oferta no puede estar vacío")
    private String nombreEstadoOferta;    
}
