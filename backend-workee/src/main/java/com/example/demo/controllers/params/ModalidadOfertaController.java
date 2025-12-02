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

import com.example.demo.dtos.params.ModalidadOfertaRequestDTO;
import com.example.demo.entities.params.ModalidadOferta;
import com.example.demo.services.params.ModalidadOfertaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/modalidadesOferta")
@Tag(name = "Modalidad Oferta", description = "Controlador para operaciones CRUD")
public class ModalidadOfertaController {

    private final ModalidadOfertaService modalidadOfertaService;

    public ModalidadOfertaController(ModalidadOfertaService modalidadOfertaService) {
        this.modalidadOfertaService = modalidadOfertaService;
    }

    @Operation(summary = "Crear una nueva Modalidad Oferta")
    @PostMapping()
    @PreAuthorize("hasAuthority('GESTIONAR_MODALIDAD_OFERTA')")
    public ResponseEntity<ModalidadOferta> crearModalidadOferta(@Valid @RequestBody ModalidadOfertaRequestDTO modalidadOfertaRequestDTO){
        ModalidadOferta nuevaModalidadOferta = modalidadOfertaService.guardarModalidadOferta(modalidadOfertaRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaModalidadOferta);
    }

    @Operation(summary = "Actualizar una Modalidad Oferta Existente")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_MODALIDAD_OFERTA')")
    public ResponseEntity<ModalidadOferta> actualizarModalidadOferta(@PathVariable Long id, @RequestBody ModalidadOfertaRequestDTO modalidadOfertaRequestDTO) {
        ModalidadOferta modalidadOfertaActualizada = modalidadOfertaService.actualizarModalidadOferta(id, modalidadOfertaRequestDTO);
        return ResponseEntity.ok(modalidadOfertaActualizada);
    }

    @Operation(summary = "Obtener todas las Modalidad Oferta")
    @GetMapping
    @PreAuthorize("hasAuthority('GESTIONAR_MODALIDAD_OFERTA')")
    public ResponseEntity<List<ModalidadOferta>> obtenerModalidadOferta() {
        List<ModalidadOferta> listaModalidadOferta = modalidadOfertaService.obtenerModalidadesOfertas();
        return ResponseEntity.ok(listaModalidadOferta);
    }

    @Operation(summary = "Obtener todas las Modalidades Oferta Activas")
    @GetMapping("/activas")
    @PreAuthorize("hasAuthority('GESTIONAR_MODALIDAD_OFERTA') or hasAuthority('BUSCAR_OFERTAS') or hasAuthority('GESTION_OFERTAS')") 
    public ResponseEntity<List<ModalidadOferta>> obtenerModalidadOfertaActivos() {
        List<ModalidadOferta> listaModalidadOfertaActivas = modalidadOfertaService.obtenerModalidadesOfertasActivos();
        return ResponseEntity.ok(listaModalidadOfertaActivas);
    }
    
    @Operation(summary = "Obtener una Modalidad Oferta por ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_MODALIDAD_OFERTA')")
    public ResponseEntity<ModalidadOferta> obtenerModalidadOfertaPorId(@PathVariable Long id) {
        ModalidadOferta modalidadOferta = modalidadOfertaService.findById(id);
        return ResponseEntity.ok(modalidadOferta);
    }

    @Operation(summary = "Deshabilitar una Modalidad Oferta")
    @DeleteMapping("/deshabilitar/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_MODALIDAD_OFERTA')")
    public ResponseEntity<Void> deshabilitarModalidadOferta(@PathVariable Long id) {
        modalidadOfertaService.deshabilitarModalidadOferta(id);
        return ResponseEntity.ok().build();
    }
    
    @Operation(summary = "Habilitar una Modalidad Oferta")
    @PutMapping("/habilitar/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_MODALIDAD_OFERTA')")
    public ResponseEntity<Void> habilitarModalidadOferta(@PathVariable Long id) {
        modalidadOfertaService.habilitarModalidadOferta(id);
        return ResponseEntity.ok().build();
    }
    
}
