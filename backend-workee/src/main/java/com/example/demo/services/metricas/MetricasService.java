package com.example.demo.services.metricas;

import java.time.LocalDateTime;

import com.example.demo.dtos.metricas.admin.EstadisticasAdminDTO;
import com.example.demo.dtos.metricas.candidato.EstadisticasCandidatoDTO;
import com.example.demo.dtos.metricas.empresa.EstadisticasEmpresaDTO;

public interface MetricasService {
    //ADMIN DEL SISTEMA
    public EstadisticasAdminDTO verEstadisticasAdminSistema(LocalDateTime fechaDesde, LocalDateTime fechaHasta);

    //CANDIDATO
    public EstadisticasCandidatoDTO verEstadisticasCandidato(Long idCandidato, LocalDateTime fechaDesde, LocalDateTime fechaHasta);

    //EMPRESA
    public EstadisticasEmpresaDTO verEstadisticasEmpresa(Long idEmpresa, LocalDateTime fechaDesde, LocalDateTime fechaHasta);

}
