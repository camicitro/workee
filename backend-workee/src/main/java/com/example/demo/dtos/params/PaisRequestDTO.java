package com.example.demo.dtos.params;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaisRequestDTO {
    @NotBlank(message = "El nombre del país no puede estar vacío")
    private String nombrePais;

}
