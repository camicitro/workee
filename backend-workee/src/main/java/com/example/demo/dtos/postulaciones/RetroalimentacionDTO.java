package com.example.demo.dtos.postulaciones;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RetroalimentacionDTO {
    private Long idPostulacion;
    private Long idPostulacionOfertaEtapa;

    @NotBlank(message = "La retroalimentación no debe estar vacía")
    @Size(min = 5, max = 350, message = "La retroalimentación debe tener entre 5 y 350 caracteres.")
    private String retroalimentacion;
}
