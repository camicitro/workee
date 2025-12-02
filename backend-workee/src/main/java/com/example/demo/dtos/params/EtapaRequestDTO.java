package com.example.demo.dtos.params;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EtapaRequestDTO {
    @NotBlank(message = "El nombre de la etapa no puede estar vacío")
    private String nombreEtapa;

    @NotBlank(message = "La decripcion de la etapa no puede estar vacía")
    private String descripcionEtapa;
}
