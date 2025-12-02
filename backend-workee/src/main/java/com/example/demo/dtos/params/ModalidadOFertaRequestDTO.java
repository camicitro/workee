package com.example.demo.dtos.params;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ModalidadOfertaRequestDTO {
    @NotBlank(message = "El nombre de la modalidad de oferta no puede estar vacío")
    private String nombreModalidadOferta;
}
