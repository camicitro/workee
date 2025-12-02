package com.example.demo.controllers.params;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dtos.params.EstadoBusquedaRequestDTO;
import com.example.demo.entities.params.EstadoBusqueda;
import com.example.demo.services.params.EstadoBusquedaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;



@RestController
@RequestMapping("/estadosBusqueda")
@Tag(name = "Estado Busqueda", description  = "Controlador para operaciones CRUD")
public class EstadoBusquedaController {

    private final EstadoBusquedaService estadoBusquedaService;

    public EstadoBusquedaController(EstadoBusquedaService estadoBusquedaService) {
        this.estadoBusquedaService = estadoBusquedaService;
    }
    
    @Operation(summary = "Crear un nuevo Estado de Busqueda")
    @PostMapping("")
    @PreAuthorize("hasAuthority('GESTIONAR_ESTADO_BUSQUEDA')")
    public ResponseEntity<EstadoBusqueda> crearEstadoBusqueda(@Valid @RequestBody EstadoBusquedaRequestDTO estadoBusquedaRequestDTO){
        EstadoBusqueda nuevoEstadoBusqueda = estadoBusquedaService.guardarEstadoBusqueda(estadoBusquedaRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoEstadoBusqueda);
    }

    @Operation(summary = "Actualizar un Estado de Busqueda Existente")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_ESTADO_BUSQUEDA')")
    public ResponseEntity<EstadoBusqueda> actualizarEstadoBusqueda(@PathVariable Long id, @RequestBody EstadoBusquedaRequestDTO estadoBusquedaRequestDTO) {
        EstadoBusqueda estadoBusquedaActualizado = estadoBusquedaService.actualizarEstadoBusqueda(id, estadoBusquedaRequestDTO);
        return ResponseEntity.ok(estadoBusquedaActualizado);
    }

    @Operation(summary = "Obtener todos los Estados Busqueda")
    @GetMapping()
    @PreAuthorize("hasAuthority('GESTIONAR_ESTADO_BUSQUEDA')")
    public ResponseEntity<List<EstadoBusqueda>> obtenerEstadosBusqueda() {
        List<EstadoBusqueda> listaEstadosBusqueda = estadoBusquedaService.obtenerEstadosBusqueda();
        return ResponseEntity.ok(listaEstadosBusqueda);
    }

    @Operation(summary = "Obtener todos los Estados Busqueda Activos")
    @GetMapping("/activos")
    public ResponseEntity<List<EstadoBusqueda>> obtenerEstadosBusquedaActivos() {
        List<EstadoBusqueda> listaEstadosBusquedaActivos = estadoBusquedaService.obtenerEstadosBusquedaActivos();
        return ResponseEntity.ok(listaEstadosBusquedaActivos) ;
    }
    
    @Operation(summary = "Obtener un Estado de Busqueda por ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_ESTADO_BUSQUEDA') or hasAuthority('GESTIONAR_MI_PERFIL')")
    public ResponseEntity<EstadoBusqueda> obtenerEstadoBusquedaPorId(@PathVariable Long id) {
        EstadoBusqueda estadoBusqueda = estadoBusquedaService.findById(id);
        return ResponseEntity.ok(estadoBusqueda);
    }

    @Operation(summary = "Deshabilitar un Estado de Busqueda")
    @DeleteMapping("/deshabilitar/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_ESTADO_BUSQUEDA')")
    public ResponseEntity<Void> deshabilitarEstadoBusqueda(@PathVariable Long id) {
        estadoBusquedaService.deshabilitarEstadoBusqueda(id);
        return ResponseEntity.ok().build();
    }
    
    @Operation(summary = "Habilitar un Estado de Busqueda")
    @PutMapping("/habilitar/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_ESTADO_BUSQUEDA')")
    public ResponseEntity<Void> habilitarEstadoBusqueda(@PathVariable Long id) {
        estadoBusquedaService.habilitarEstadoBusqueda(id);
        return ResponseEntity.ok().build();
    }
    



    
    
}
