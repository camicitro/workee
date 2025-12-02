package com.example.demo.dtos.seguridad;

import java.util.Date;

import com.example.demo.entities.params.Rubro;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmpresaPendienteHabilitacionDTO {
    private Long idEmpresa;
    private String nombreEmpresa;
    private String logoEmpresa;
    private String correoEmpresa;
    private Date fechaHoraRegistroEmpresa;
    private Rubro rubro;
}
