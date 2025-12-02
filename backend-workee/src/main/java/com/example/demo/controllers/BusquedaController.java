package com.example.demo.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dtos.busquedas.FiltrosCandidatoRequestDTO;
import com.example.demo.dtos.busquedas.FiltrosEmpresaRequestDTO;
import com.example.demo.dtos.busquedas.FiltrosOfertaRequestDTO;
import com.example.demo.dtos.busquedas.ResultadoBusquedaEmpresaDTO;
import com.example.demo.dtos.busquedas.UbicacionDTO;
import com.example.demo.entities.candidato.Candidato;
import com.example.demo.entities.oferta.Oferta;
import com.example.demo.services.candidato.CandidatoService;
import com.example.demo.services.empresa.EmpresaService;
import com.example.demo.services.oferta.OfertaService;
import com.example.demo.services.params.ProvinciaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/busquedas")
@Tag(name = "Búsquedas", description = "Controlador para realizar distintos tipos de búsquedas")
public class BusquedaController {

    private final EmpresaService empresaService;
    private final ProvinciaService provinciaService;
    private final CandidatoService candidatoService;
    private final OfertaService ofertaService;

    public BusquedaController(EmpresaService empresaService, ProvinciaService provinciaService, CandidatoService candidatoService, OfertaService ofertaService){
        this.empresaService = empresaService;
        this.provinciaService = provinciaService;
        this.candidatoService = candidatoService;
        this.ofertaService = ofertaService;
    }

    @Operation(summary = "Trae empresas según los filtros aplicados")
    @PostMapping("/empresasFiltradas")
    @PreAuthorize("hasAuthority('BUSCAR_EMPRESAS')")
    public ResponseEntity<?> filtrarEmpresas(@RequestBody FiltrosEmpresaRequestDTO filtrosEmpresaRequestDTO){
        List<ResultadoBusquedaEmpresaDTO> empresas = empresaService.buscarEmpresasConFiltros(filtrosEmpresaRequestDTO);

        return ResponseEntity.status(HttpStatus.OK).body(empresas);
    }

    @Operation(summary = "Trae opciones para el filtro 'Ubicación' (Provincia, Pais)")
    @GetMapping("/filtroUbicacion")
    @PreAuthorize("hasAuthority('BUSCAR_EMPRESAS') or hasAuthority('BUSCAR_OFERTAS') or hasAuthority('BUSCAR_CANDIDATOS')")
    public ResponseEntity<?> visualizarOpcionesFiltroUbicacion(){
        List<UbicacionDTO> ubicaciones = provinciaService.traerUbicaciones();
        System.out.println("ubicaciones " + ubicaciones.getFirst());
        return ResponseEntity.status(HttpStatus.OK).body(ubicaciones);
    }

    @Operation(summary = "Busca empresas según el nombre ingresado")
    @GetMapping("/empresasPorNombre")
    @PreAuthorize("hasAuthority('BUSCAR_EMPRESAS')")
    public ResponseEntity<?> buscarEmpresasPorNombre(@RequestParam String nombreEmpresa){
        List<ResultadoBusquedaEmpresaDTO> empresas = empresaService.buscarEmpresasPorNombre(nombreEmpresa);
        return ResponseEntity.status(HttpStatus.OK).body(empresas);
    }

    @Operation(summary = "Trae candidatos según los filtros aplicados")
    @PostMapping("/candidatosFiltrados")
    @PreAuthorize("hasAuthority('BUSCAR_CANDIDATOS')")
    public ResponseEntity<?> filtrarCandidatos(@RequestBody FiltrosCandidatoRequestDTO filtrosCandidatoRequestDTO){
        List<Candidato> candidatos = candidatoService.buscarCandidatosConFiltros(filtrosCandidatoRequestDTO);

        return ResponseEntity.status(HttpStatus.OK).body(candidatos);
    }

    @Operation(summary = "Busca candidatos según el nombre ingresado")
    @GetMapping("/candidatosPorNombre")
    @PreAuthorize("hasAuthority('BUSCAR_CANDIDATOS')")
    public ResponseEntity<?> buscarCandidatosPorNombre(@RequestParam String nombreCandidato){
        List<Candidato> candidatos = candidatoService.buscarCandidatosPorNombre(nombreCandidato);
        return ResponseEntity.status(HttpStatus.OK).body(candidatos);
    }

    @Operation(summary = "Busca ofertas según el nombre ingresado")
    @GetMapping("/ofertasPorNombre")
    @PreAuthorize("hasAuthority('BUSCAR_OFERTAS')")
    public ResponseEntity<?> buscarOfertasPorNombre(@RequestParam String nombreOferta){
        List<Oferta> ofertas = ofertaService.buscarOfertasPorNombre(nombreOferta);
        return ResponseEntity.status(HttpStatus.OK).body(ofertas);
    }

    @Operation(summary = "Trae ofertas según los filtros aplicados")
    @PostMapping("/ofertasFiltradas")
    @PreAuthorize("hasAuthority('BUSCAR_OFERTAS')")
    public ResponseEntity<?> filtrarOferta(@RequestBody FiltrosOfertaRequestDTO filtrosOfertaRequestDTO){
        List<Oferta> ofertas = ofertaService.buscarOfertasSegunFiltros(filtrosOfertaRequestDTO);

        return ResponseEntity.status(HttpStatus.OK).body(ofertas);
    }

}
