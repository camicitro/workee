package com.example.demo.controllers.seguridad;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dtos.seguridad.EmpresaPendienteHabilitacionDTO;
import com.example.demo.entities.params.CodigoEstadoUsuario;
import com.example.demo.services.empresa.EmpresaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping(path ="/administrador")
@Tag(name = "Acciones del administrador", description = "Controlador para operaciones que puede realizar solo el administrador")
public class AdministradorController {
    private final EmpresaService empresaService;

    public AdministradorController(EmpresaService empresaService){
        this.empresaService = empresaService;
    }

    @Operation(summary = "Se habilita una empresa")
    @PutMapping("/habilitaciones/habilitar/{idEmpresa}")
    @PreAuthorize("hasAuthority('HABILITACION_EMPRESA')")
    public ResponseEntity<?> habilitarEmpresa(@PathVariable Long idEmpresa){
        empresaService.rechazarOAceptarEmpresa(idEmpresa, CodigoEstadoUsuario.HABILITADO); //habilitarEmpresa(idEmpresa);
        return ResponseEntity.status(HttpStatus.OK).body("La empresa se ha habilitado exitosamente.");
    }

    @Operation(summary = "Se rechaza una empresa")
    @PutMapping("/habilitaciones/rechazar/{idEmpresa}")
    @PreAuthorize("hasAuthority('HABILITACION_EMPRESA')")
    public ResponseEntity<?> rechazarEmpresa(@PathVariable Long idEmpresa){
        empresaService.rechazarOAceptarEmpresa(idEmpresa, CodigoEstadoUsuario.RECHAZADO); 
        return ResponseEntity.status(HttpStatus.OK).body("La empresa se ha rechazado exitosamente.");
    }

    @Operation(summary = "Ver empresas pendientes por habilitar")
    @GetMapping("/habilitaciones")
    @PreAuthorize("hasAuthority('HABILITACION_EMPRESA')")
    public ResponseEntity<?> visualizarEmpresasPendientesDeHabiltiacion(){
        List<EmpresaPendienteHabilitacionDTO> empresasPendientes = empresaService.buscarEmpresasPendientesDeHabilitacion("Pendiente");
        return ResponseEntity.status(HttpStatus.OK).body(empresasPendientes);
    }
}
