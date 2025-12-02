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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dtos.params.PaisRequestDTO;
import com.example.demo.entities.params.Pais;
import com.example.demo.services.params.PaisService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/paises")
@Tag(name = "Pais", description = "Controlador para operaciones CRUD de Pais")
public class PaisController  {

    private final PaisService paisService;

    public PaisController(PaisService paisService) {
        this.paisService = paisService;
    }


    @Operation(summary = "Crea un pais")
    @PostMapping("")
    @PreAuthorize("hasAuthority('GESTIONAR_PAIS')")
    public ResponseEntity<?> crearPais(@Valid @RequestBody PaisRequestDTO paisRequestDTO) {
        Pais nuevoPais = paisService.guardarPais(paisRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoPais);
    }

    @Operation(summary = "Actualiza un pais")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_PAIS')")
    public ResponseEntity<?> actualizarPais(@PathVariable Long id, @RequestBody PaisRequestDTO paisRequestDTO) {
        Pais paisActualizado = paisService.actualizarPais(id, paisRequestDTO);
        return ResponseEntity.status(HttpStatus.OK).body(paisActualizado);
    }

    @Operation(summary = "Obtiene todos los paises")
    @GetMapping("")
    @PreAuthorize("hasAuthority('GESTIONAR_PAIS')")
    public ResponseEntity<?> obtenerPaises() {
        List<Pais> paises = paisService.obtenerPaises();
        return ResponseEntity.status(HttpStatus.OK).body(paises);
    }

    @Operation(summary = "Obtiene todos los paises ACTIVOS")
    @GetMapping("/activos")
    public ResponseEntity<?> obtenerPaisesActivos() {
        List<Pais> paises = paisService.obtenerPaisesActivos();
        return ResponseEntity.status(HttpStatus.OK).body(paises);
    }

    @Operation(summary = "Obtiene un pais por su ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_PAIS')")
    public ResponseEntity<?> obtenerPais(@PathVariable Long id) {
        Pais pais = paisService.findById(id);

        return ResponseEntity.status(HttpStatus.OK).body(pais);
    }


    @Operation(summary = "Deshabilita un pais")
    @DeleteMapping("/deshabilitar/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_PAIS')")
    public ResponseEntity<?> deshabilitarPais(@PathVariable Long id) {
        paisService.deshabilitarPais(id); 
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @Operation(summary = "Habilita un pais")
    @PutMapping("/habilitar/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_PAIS')")
    public ResponseEntity<?> habilitarPais(@PathVariable Long id) {
        paisService.habilitarPais(id);
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    
}

