package com.example.demo.dtos.metricas.admin;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FiltroFechasDTO {
    private LocalDateTime fechaDesde;
    private LocalDateTime fechaHasta;
}
