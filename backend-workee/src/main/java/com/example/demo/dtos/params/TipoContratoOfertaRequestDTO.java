package com.example.demo.dtos.params;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TipoContratoOfertaRequestDTO {
    @NotBlank(message = "El nombre del tipo de contrato oferta es obligatorio")
    private String nombreTipoContratoOferta;
}
