package com.example.demo.dtos.params;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GeneroRequestDTO {
    @NotBlank(message = "El nombre del género no puede estar vacío")
    String nombreGenero;
}
