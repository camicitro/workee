package com.example.demo.dtos.seguridad;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FiltrosUsuariosRequestDTO {
    @NotNull(message = "La lista de ids de rol no puede ser nula")
    public List<Long> idsRol;
}
