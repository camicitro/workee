package com.example.demo.controllers.params;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dtos.params.EstadoUsuarioRequestDTO;
import com.example.demo.entities.params.EstadoUsuario;
import com.example.demo.services.params.EstadoUsuarioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequestMapping("/estadosUsuario")
@Tag(name = "EstadoUsuario", description = "Controlador para operaciones CRUD de EstadoUsuario")
public class EstadoUsuarioController {
    
    private final EstadoUsuarioService estadoUsuarioService;

    public EstadoUsuarioController(EstadoUsuarioService estadoUsuarioService) {
        this.estadoUsuarioService = estadoUsuarioService;
    }

    @Operation(summary = "Crear un nuevo EstadoUsuario")
    @PostMapping("")
    @PreAuthorize("hasAuthority('GESTIONAR_ESTADO_USUARIO')")
    public ResponseEntity<?> crearEstadoUsuario(@Valid @RequestBody EstadoUsuarioRequestDTO estadoUsuarioRequestDTO){
        EstadoUsuario nuevoEstadoUsuario = estadoUsuarioService.guardarEstadoUsuario(estadoUsuarioRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoEstadoUsuario);
    }

    @Operation(summary = "Actualizar un EstadoUsuario existente")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_ESTADO_USUARIO')")
    public ResponseEntity<?> actualizarEstadoUsuario(@PathVariable Long id, @RequestBody EstadoUsuarioRequestDTO estadoUsuarioRequestDTO) {
        EstadoUsuario estadoUsuarioActualizado = estadoUsuarioService.actualizarEstadoUsuario(id, estadoUsuarioRequestDTO);
        return ResponseEntity.status(HttpStatus.OK).body(estadoUsuarioActualizado);
    }

    @Operation(summary = "Obtiene todos los EstadoUsuario")
    @GetMapping("")
    @PreAuthorize("hasAuthority('GESTIONAR_ESTADO_USUARIO')")
    public ResponseEntity<?> obtenerEstadosUsuario(){
        List<EstadoUsuario> estadosUsuario = estadoUsuarioService.obtenerEstadosUsuario();
        return ResponseEntity.status(HttpStatus.OK).body(estadosUsuario);
    }

    @Operation(summary = "Obtiene todos los EstadoUsuario ACTIVOS")
    @GetMapping("/activos")
    @PreAuthorize("hasAuthority('GESTIONAR_ESTADO_USUARIO')") 
    public ResponseEntity<?> obtenerEstadosUsuarioActivos(){
        List<EstadoUsuario> estadosUsuarioActivos = estadoUsuarioService.obtenerEstadosUsuarioActivos();
        return ResponseEntity.status(HttpStatus.OK).body(estadosUsuarioActivos);
    }
    
    @Operation(summary = "Obtiene un EstadoUsuario por su ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_ESTADO_USUARIO')")
    public ResponseEntity<?> obtenerEstadoUsuarioPorId(@PathVariable Long id) {
        EstadoUsuario estadoUsuario = estadoUsuarioService.findById(id); 
        return ResponseEntity.status(HttpStatus.OK).body(estadoUsuario);
    }

    @Operation(summary = "Deshabilita un EstadoUsuario")
    @DeleteMapping("/deshabilitar/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_ESTADO_USUARIO')")
    public ResponseEntity<?> deshabilitarEstadoUsuario(@PathVariable Long id) {
        estadoUsuarioService.deshabilitarEstadoUsuario(id);
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @Operation(summary = "Habilita un EstadoUsuario")
    @PutMapping("/habilitar/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_ESTADO_USUARIO')")
    public ResponseEntity<?> habilitarEstadoUsuario(@PathVariable Long id) {
        estadoUsuarioService.habilitarEstadoUsuario(id);
        return ResponseEntity.status(HttpStatus.OK).build();
    }

}
