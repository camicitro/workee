package com.example.demo.dtos.params;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TipoEventoRequestDTO {
    @NotBlank(message = "El nombre del tipo de evento es obligatorio")
    private String nombreTipoEvento;
}
