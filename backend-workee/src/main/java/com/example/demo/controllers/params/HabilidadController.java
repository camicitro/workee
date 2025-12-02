package com.example.demo.controllers.params;

import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dtos.params.HabilidadRequestDTO;
import com.example.demo.entities.params.Habilidad;
import com.example.demo.services.params.HabilidadService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;


@RestController
@RequestMapping("/habilidades")
@Tag(name = "Habilidad", description = "Controlador para operaciones CRUD de Habilidad")
public class HabilidadController {
 
    private final HabilidadService habilidadService;
    
    public HabilidadController(HabilidadService habilidadService) {
        this.habilidadService = habilidadService;
    }

    @Operation(summary = "Obtener Habilidades por Tipo Habilidad")
    @GetMapping("/habilidadesPorTipoHabilidad/{idTipoHabilidad}")
    public ResponseEntity<List<Habilidad>> getHabilidadesByTipoHabilidad(@PathVariable Long idTipoHabilidad) {
        List<Habilidad> listaHabilidadesPorTipo = habilidadService.findHabilidadByTipoHabilidad(idTipoHabilidad);
        return ResponseEntity.ok(listaHabilidadesPorTipo);
    }
    
    @Operation(summary = "Crear una nueva Habilidad")
    @PostMapping()
    @PreAuthorize("hasAuthority('GESTIONAR_HABILIDAD')")
    public ResponseEntity<Habilidad> crearHabilidad(@Valid @RequestBody HabilidadRequestDTO habilidadRequestDTO){      
        Habilidad nuevaHabilidad = habilidadService.guardarHabilidad(habilidadRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaHabilidad);
    }

    @Operation(summary = "Actualizar una Habilidad Existente")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_HABILIDAD')")
    public ResponseEntity<Habilidad> actualizarHabilidad(@PathVariable Long id, @RequestBody HabilidadRequestDTO habilidadRequestDTO) {
        Habilidad habilidadActualizada = habilidadService.actualizarHabilidad(id, habilidadRequestDTO);
        return ResponseEntity.ok(habilidadActualizada);
    }

    @Operation(summary = "Obtener todas las Habilidades")
    @GetMapping()
    @PreAuthorize("hasAuthority('GESTIONAR_HABILIDAD')")
    public ResponseEntity<List<Habilidad>> obtenerHabilidades() {
        List<Habilidad> listaHabilidades = habilidadService.obtenerHabilidades();
        return ResponseEntity.ok(listaHabilidades);
    }

    @Operation(summary = "Obtener todas las Habilidades Activas")
    @GetMapping("/activas")
    public ResponseEntity<List<Habilidad>> obtenerHabilidadesActivas() {
        List<Habilidad> listaHabilidadesActivas = habilidadService.obtenerHabilidadesActivas();
        return ResponseEntity.ok(listaHabilidadesActivas) ;
    }
    
    @Operation(summary = "Obtener una Habilidad por ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_HABILIDAD')")
    public ResponseEntity<Habilidad> obtenerHabilidadPorId(@PathVariable Long id) {
        Habilidad habilidad = habilidadService.findById(id);
        return ResponseEntity.ok(habilidad);
    }

    @Operation(summary = "Deshabilitar Habilidad")
    @DeleteMapping("/deshabilitar/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_HABILIDAD')")
    public ResponseEntity<Void> deshabilitarHabillidad(@PathVariable Long id) {
        habilidadService.deshabilitarHabilidad(id);
        return ResponseEntity.ok().build();
    }
    
    @Operation(summary = "Habilitar Habilidad")
    @PutMapping("/habilitar/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_HABILIDAD')")
    public ResponseEntity<Void> habilitarHabilidad(@PathVariable Long id) {
        habilidadService.habilitarHabilidad(id);
        return ResponseEntity.ok().build();
    }
}

