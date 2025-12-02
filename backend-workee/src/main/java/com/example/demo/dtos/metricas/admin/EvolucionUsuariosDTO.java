package com.example.demo.dtos.metricas.admin;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EvolucionUsuariosDTO {
    private LocalDate fecha;  // eje X
    private Long cantidad;    // eje Y
}
