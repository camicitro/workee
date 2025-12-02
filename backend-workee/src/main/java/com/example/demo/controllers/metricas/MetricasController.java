package com.example.demo.controllers.metricas;


import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dtos.metricas.admin.EstadisticasAdminDTO;
import com.example.demo.dtos.metricas.admin.FiltroFechasDTO;
import com.example.demo.dtos.metricas.candidato.EstadisticasCandidatoDTO;
import com.example.demo.dtos.metricas.empresa.EstadisticasEmpresaDTO;
import com.example.demo.services.metricas.MetricasService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping(path = "/metricas")
@Tag(name = "Metricas", description = "Controlador para las métricas")
public class MetricasController {
    private final MetricasService metricasService;

    public MetricasController(MetricasService metricasService){
        this.metricasService = metricasService;
    }
    //ADMINISTRADOR DEL SISTEMA
    @Operation(summary = "Ver métricas del admin del sistema")
    @PutMapping("/admin")
    @PreAuthorize("hasAuthority('METRICAS_SISTEMA')")
    public ResponseEntity<?> metricasAdminSist(@RequestBody FiltroFechasDTO filtroFechasDTO) {
        EstadisticasAdminDTO estadisticas = metricasService.verEstadisticasAdminSistema(filtroFechasDTO.getFechaDesde(), filtroFechasDTO.getFechaHasta());
        return ResponseEntity.ok().body(estadisticas);
    }
    
    //CANDIDATOS
    @Operation(summary = "Ver métricas de un candidato")
    @PutMapping("/candidato/{idCandidato}")
    @PreAuthorize("hasAuthority('METRICAS_CANDIDATO')")
    public ResponseEntity<?> metricasCandidato(@PathVariable Long idCandidato, @RequestBody FiltroFechasDTO filtroFechasDTO) {
        EstadisticasCandidatoDTO estadisticas = metricasService.verEstadisticasCandidato(idCandidato, filtroFechasDTO.getFechaDesde(), filtroFechasDTO.getFechaHasta());
        return ResponseEntity.ok().body(estadisticas);
    }

    //EMPRESAS
    @Operation(summary = "Ver métricas de una empresa")
    @PutMapping("/empresa/{idEmpresa}")
    @PreAuthorize("hasAuthority('METRICAS_EMPRESA')")
    public ResponseEntity<?> verDistribucionGeneros(@PathVariable Long idEmpresa, @RequestBody FiltroFechasDTO filtroFechasDTO) {
        EstadisticasEmpresaDTO estadisticas = metricasService.verEstadisticasEmpresa(idEmpresa, filtroFechasDTO.getFechaDesde(), filtroFechasDTO.getFechaHasta());
        return ResponseEntity.ok().body(estadisticas);
    }

}