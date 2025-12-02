package com.example.demo.controllers.params;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

import com.example.demo.dtos.params.TipoHabilidadRequestDTO;
import com.example.demo.entities.params.TipoHabilidad;
import com.example.demo.services.params.TipoHabilidadService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/tipoHabilidades")
@Tag(name = "Tipo Habilidad", description = "Controlador para operaciones CRUD")
public class TipoHabilidadController {

    private final TipoHabilidadService tipoHabilidadService;

    public TipoHabilidadController(TipoHabilidadService tipoHabilidadService) {
        this.tipoHabilidadService = tipoHabilidadService;
    }    

    @Operation(summary = "Crear un nuevo Tipo Habilidad")
    @PostMapping
    @PreAuthorize("hasAuthority('GESTIONAR_TIPO_HABILIDAD')")
    public ResponseEntity<TipoHabilidad> crearTipoHabilidad(@Valid @RequestBody TipoHabilidadRequestDTO tipoHabilidadRequestDTO){
        TipoHabilidad nuevoTipoHabilidad = tipoHabilidadService.guardarTipoHabilidad(tipoHabilidadRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoTipoHabilidad);
    }

    @Operation(summary = "Actualizar un Tipo Habilidad Existente")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_TIPO_HABILIDAD')")
    public ResponseEntity<TipoHabilidad> actualizarTipoHabilidad(@PathVariable Long id, @RequestBody TipoHabilidadRequestDTO tipoHabilidadRequestDTO) {
        TipoHabilidad tipoHabilidadActualizado = tipoHabilidadService.actualizarTipoHabilidad(id, tipoHabilidadRequestDTO);
        return ResponseEntity.ok(tipoHabilidadActualizado);
    }

    @Operation(summary = "Obtener todos los Tipos de Habilidad")
    @GetMapping
    @PreAuthorize("hasAuthority('GESTIONAR_TIPO_HABILIDAD')")
    public ResponseEntity<List<TipoHabilidad>> obtenerTipoHabilidad() {
        List<TipoHabilidad> listaTipoHabilidades = tipoHabilidadService.obtenerTipoHabilidades();
        return ResponseEntity.ok(listaTipoHabilidades);
    }

    @Operation(summary = "Obtener todos los Tipos de Habilidad Activos")
    @GetMapping("/activos")
    public ResponseEntity<List<TipoHabilidad>> obtenerTipoHabilidadActivos() {
        List<TipoHabilidad> listaTipoHabilidadesActivos = tipoHabilidadService.obtenerTipoHabilidadesActivos();
        return ResponseEntity.ok(listaTipoHabilidadesActivos);
    }
    
    @Operation(summary = "Obtener un Tipo Habilidad por ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_TIPO_HABILIDAD')")
    public ResponseEntity<TipoHabilidad> obtenerTipoHabilidadPorId(@PathVariable Long id) {
        TipoHabilidad tipoHabilidad = tipoHabilidadService.findById(id);
        return ResponseEntity.ok(tipoHabilidad);
    }

    @Operation(summary = "Deshabilitar un Tipo Habilidad")
    @DeleteMapping("/deshabilitar/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_TIPO_HABILIDAD')")
    public ResponseEntity<Void> deshabilitarTipoHabilidad(@PathVariable Long id) {
        tipoHabilidadService.deshabilitarTipoHabilidad(id);
        return ResponseEntity.ok().build();
    }
    
    @Operation(summary = "Habilitar un Tipo Habilidad")
    @PutMapping("/habilitar/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_TIPO_HABILIDAD')")
    public ResponseEntity<Void> habilitarTipoHabilidad(@PathVariable Long id) {
        tipoHabilidadService.habilitarTipoHabilidad(id);
        return ResponseEntity.ok().build();
    }
}
