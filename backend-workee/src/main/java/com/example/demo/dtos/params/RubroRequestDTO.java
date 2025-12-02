package com.example.demo.dtos.params;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RubroRequestDTO {
    @NotBlank (message = "El nombre del rubro no puede estar vacío")
    private String nombreRubro;
}
