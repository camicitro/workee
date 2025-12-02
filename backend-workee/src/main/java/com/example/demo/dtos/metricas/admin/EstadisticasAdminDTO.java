package com.example.demo.dtos.metricas.admin;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EstadisticasAdminDTO {
    public Integer cantidadHistoricaUsuarios;
    public Double tasaExitoOfertas;
    public DistribucionUsuariosPorRolResponseDTO distribucionUsuariosPorRol;
    public List<UsuariosPorPaisDTO> cantidadUsuariosPorPais;
    public List<EmpresasConMasOfertasDTO> empresasConMasOfertas;
    public List<EvolucionUsuariosDTO> evolucionUsuariosRegistrados;

}
