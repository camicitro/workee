package com.example.demo.controllers.params;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dtos.params.EstadoOfertaRequestDTO;
import com.example.demo.entities.params.EstadoOferta;
import com.example.demo.services.params.EstadoOfertaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;



@RestController
@RequestMapping("/estadosOferta")
@Tag(name = "Estado Oferta", description = "Controlador para operaciones CRUD")
public class EstadoOfertaController {

    private final EstadoOfertaService estadoOfertaService;

    public EstadoOfertaController(EstadoOfertaService estadoOfertaService) {
        this.estadoOfertaService = estadoOfertaService;
    }

    @Operation(summary = "Crear un Estado Oferta")
    @PostMapping()
    @PreAuthorize("hasAuthority('GESTIONAR_ESTADO_OFERTA')")
    public ResponseEntity<EstadoOferta> crearEstadoOFerta(@Valid @RequestBody EstadoOfertaRequestDTO estadoOfertaRequestDTO){
        EstadoOferta nuevoEstadoOferta = estadoOfertaService.guardarEstadoOferta(estadoOfertaRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoEstadoOferta);    
    }

    @Operation(summary = "Actualizar un Estado Oferta Existente")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_ESTADO_OFERTA')")
    public ResponseEntity<EstadoOferta> actualizarEstadoOferta(@PathVariable Long id, @RequestBody EstadoOfertaRequestDTO estadoOfertaRequestDTO) {
        EstadoOferta estadoOfertaActualizado = estadoOfertaService.actualizarEstadoOferta(id, estadoOfertaRequestDTO);
        return ResponseEntity.ok(estadoOfertaActualizado);
    }

    @Operation(summary = "Obtener todos los Estado Oferta")
    @GetMapping()
    @PreAuthorize("hasAuthority('GESTIONAR_ESTADO_OFERTA')")
    public ResponseEntity<List<EstadoOferta>> obtenerEstadosOferta() {
        List<EstadoOferta> listaEstadosOferta = estadoOfertaService.obtenerEstadoOfertas();
        return ResponseEntity.ok(listaEstadosOferta);
    }

    @Operation(summary = "Obtener los Estados Oferta Activos")
    @GetMapping("/activos")
    @PreAuthorize("hasAuthority('GESTIONAR_ESTADO_OFERTA') or hasAuthority('GESTION_OFERTAS')") 
    public ResponseEntity<List<EstadoOferta>> obtenerEstadosOfertaActivos() {
        List<EstadoOferta> listaEstadosOfertaActivos = estadoOfertaService.obtenerEstadoOfertasActivos();
        return ResponseEntity.ok(listaEstadosOfertaActivos);
    }
    
    @Operation(summary = "Obtener un Estado Oferta por ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_ESTADO_OFERTA')")
    public ResponseEntity<EstadoOferta> obtenerEstadoOfertaPorId(@PathVariable Long id) {
        EstadoOferta estadoOferta = estadoOfertaService.findById(id);
        return ResponseEntity.ok(estadoOferta);
    }

    @Operation(summary = "Deshabilitar un Estado Oferta")
    @DeleteMapping("/deshabilitar/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_ESTADO_OFERTA')")
    public ResponseEntity<Void> deshabilitarEstadoOferta(@PathVariable Long id){
        estadoOfertaService.deshabilitarEstadoOferta(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Habilitar un Estado Oferta")
    @PutMapping("/habilitar/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_ESTADO_OFERTA')")
    public ResponseEntity<Void> habilitarEstadoOferta(@PathVariable Long id) {
        estadoOfertaService.habilitarEstadoOferta(id);
        return ResponseEntity.ok().build();
    }   
}