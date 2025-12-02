package com.example.demo.dtos.seguridad;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CorreoRequestDTO {
    
    @NotBlank(message = "Debe ingresar un correo electrónico")
    private String correo;
}
