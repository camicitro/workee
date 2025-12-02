package com.example.demo.dtos.metricas.admin;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DistribucionUsuariosPorRolResponseDTO {
    private Long cantidadTotalUsuarios;
    private List<UsuariosPorRolDTO> distribucion;
}
