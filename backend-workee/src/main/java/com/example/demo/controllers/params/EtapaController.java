package com.example.demo.controllers.params;

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
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dtos.params.EtapaRequestDTO;
import com.example.demo.entities.params.Etapa;
import com.example.demo.services.params.EtapaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/etapas")
@Tag(name = "Etapa", description = "Controlador para operaciones CRUD")
public class EtapaController {

    private final EtapaService etapaService;

    public EtapaController(EtapaService etapaService) {
        this.etapaService = etapaService;
    }
    
    @Operation(summary = "Crear una nueva Etapa Predeterminada")
    @PostMapping
    @PreAuthorize("hasAuthority('GESTIONAR_ETAPA_PARAMETRO')")
    public ResponseEntity<Etapa> crearEtapa(@Valid @RequestBody EtapaRequestDTO etapaRequestDTO){
        Etapa nuevaEtapa = etapaService.crearPredeterminada(etapaRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaEtapa);
    }

    @Operation(summary = "Crear una nueva Etapa Propia de una Empresa")
    @PostMapping("/empresa/{empresaId}")
    @PreAuthorize("hasAuthority('GESTION_ETAPA_PERSONALIZADA')")
    public ResponseEntity<Etapa> crearEtapaPropia(@PathVariable Long empresaId, @Valid @RequestBody EtapaRequestDTO etapaRequestDTO) {
        Etapa nuevaEtapa = etapaService.crearPropia(empresaId, etapaRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaEtapa);
    }

    @Operation(summary = "Actualizar una Etapa Existente")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_ETAPA_PARAMETRO') or hasAuthority('GESTION_ETAPA_PERSONALIZADA')")
    public ResponseEntity<Etapa> actualizarEtapa(@PathVariable Long id, @RequestBody EtapaRequestDTO etapaRequestDTO) {
        Etapa etapaActualizada = etapaService.actualizarEtapa(id, etapaRequestDTO);
        return ResponseEntity.ok(etapaActualizada);
    }

    @Operation(summary = "Obtener todas las Etapas")
    @GetMapping
    @PreAuthorize("hasAuthority('GESTIONAR_ETAPA_PARAMETRO')")
    public ResponseEntity<List<Etapa>> obtenerEtapa() {
        List<Etapa> listaEtapas = etapaService.obtenerEtapas();
        return ResponseEntity.ok(listaEtapas);
    }

    @Operation(summary = "Obtener todas las Etapas Activas")
    @GetMapping("/activas")
    @PreAuthorize("hasAuthority('GESTIONAR_ETAPA_PARAMETRO') or hasAuthority('GESTION_ETAPA_PERSONALIZADA')") 
    public ResponseEntity<List<Etapa>> obtenerEtapasActivas() {
        List<Etapa> listaEtapasActivas = etapaService.obtenerEtapasActivos();
        return ResponseEntity.ok(listaEtapasActivas) ;
    }
    
    @Operation(summary = "Obtener una Etapa por ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_ETAPA_PARAMETRO') or hasAuthority('GESTION_ETAPA_PERSONALIZADA')")
    public ResponseEntity<Etapa> obtenerEtapaPorId(@PathVariable Long id) {
        Etapa etapa = etapaService.findById(id);
        return ResponseEntity.ok(etapa);
    }

    @Operation(summary = "Obtener Etapas Disponibles para una Empresa")
    @GetMapping("/disponibles/empresa/{empresaId}")
    @PreAuthorize("hasAuthority('GESTION_ETAPA_PERSONALIZADA')")
    public ResponseEntity<List<Etapa>> obtenerEtapasDisponiblesParaEmpresa(@PathVariable Long empresaId) {
        List<Etapa> etapasDisponibles = etapaService.findDisponiblesParaEmpresa(empresaId);
        return ResponseEntity.ok(etapasDisponibles);
    }
    
    @Operation(summary = "Habilitar un Etapa")
    @PutMapping("/habilitar/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_ETAPA_PARAMETRO')")
    public ResponseEntity<Void> habilitarEtapa(@PathVariable Long id) {
        etapaService.habilitarEtapa(id);
        return ResponseEntity.ok().build();
    }

    //ADMIN: puede deshabilitar cualquier etapa que no esté en uso
    @Operation(summary = "Deshabilitar un Etapa")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_ETAPA_PARAMETRO') or hasAuthority('GESTION_ETAPA_PERSONALIZADA')")
    public ResponseEntity<Void> deshabilitarEtapa(@PathVariable Long id) {
        etapaService.deshabilitarEtapa(id);
        return ResponseEntity.ok().build();
    }
    
    // EMPRESA: solo puede eliminar sus etapas propias, no las predeterminadas.    
    @Operation(summary = "Eliminar una Etapa Propia de una Empresa")
    @DeleteMapping("/{id}/empresa/{empresaId}")
    @PreAuthorize("hasAuthority('GESTION_ETAPA_PERSONALIZADA')")
    public ResponseEntity<Void> eliminarEtapaPropia(@PathVariable Long id, @PathVariable Long empresaId) {
        etapaService.eliminarEtapaPropia(id, empresaId);
        return ResponseEntity.ok().build();
    }
    
}
