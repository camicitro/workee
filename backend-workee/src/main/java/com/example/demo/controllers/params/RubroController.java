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

import com.example.demo.dtos.params.RubroRequestDTO;
import com.example.demo.entities.params.Rubro;
import com.example.demo.services.params.RubroService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/rubros")
@Tag(name = "Rubro", description = "Controlador para operaciones CRUD")
public class RubroController{

    private final RubroService rubroService;

    public RubroController(RubroService rubroService) {
        this.rubroService = rubroService;
    }

    @Operation(summary = "Crear un nuevo Rubro")
    @PostMapping
    @PreAuthorize("hasAuthority('GESTIONAR_RUBRO')")
    public ResponseEntity<Rubro> crearRubro(@Valid @RequestBody RubroRequestDTO rubroRequestDTO){
        Rubro nuevoRubro = rubroService.guardarRubro(rubroRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoRubro);
    }

    @Operation(summary = "Actualizar un Rubro Existente")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_RUBRO')")
    public ResponseEntity<Rubro> actualizarRubro(@PathVariable Long id, @RequestBody RubroRequestDTO rubroRequestDTO) {
        Rubro rubroActualizado = rubroService.actualizarRubro(id, rubroRequestDTO);
        return ResponseEntity.ok(rubroActualizado);
    }

    @Operation(summary = "Obtener todos los Rubros")
    @GetMapping
    @PreAuthorize("hasAuthority('GESTIONAR_RUBRO')")
    public ResponseEntity<List<Rubro>> obtenerRubros() {
        List<Rubro> listaRubros = rubroService.obtenerRubros();
        return ResponseEntity.ok(listaRubros);
    }

    @Operation(summary = "Obtener todos los Rubros Activos")
    @GetMapping("/activos")
    public ResponseEntity<List<Rubro>> obtenerRubrosActivos() {
        List<Rubro> listaRubrosActivos = rubroService.obtenerRubrosActivos();
        return ResponseEntity.ok(listaRubrosActivos);
    }
    
    @Operation(summary = "Obtener un Rubro por ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_RUBRO')")
    public ResponseEntity<Rubro> obtenerRubroPorId(@PathVariable Long id) {
        Rubro rubro = rubroService.findById(id);
        return ResponseEntity.ok(rubro);
    }

    @Operation(summary = "Deshabilitar un Rubro")
    @DeleteMapping("/deshabilitar/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_RUBRO')")
    public ResponseEntity<Void> deshabilitarRubro(@PathVariable Long id) {
        rubroService.deshabilitarRubro(id);
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    
    @Operation(summary = "Habilitar un Rubro")
    @PutMapping("/habilitar/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_RUBRO')")
    public ResponseEntity<Void> habilitarRubro(@PathVariable Long id) {
        rubroService.habilitarRubro(id);
        return ResponseEntity.ok().build();
    }
    
}
