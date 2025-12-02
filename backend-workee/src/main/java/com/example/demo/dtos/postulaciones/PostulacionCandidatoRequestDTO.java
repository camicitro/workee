package com.example.demo.dtos.postulaciones;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostulacionCandidatoRequestDTO {
    @NotNull(message = "Seleccionar un candidato es obligatorio")
    private Long idCandidato;

    @NotNull(message = "Seleccionar una oferta es obligatorio")
    private Long idOferta;
}
