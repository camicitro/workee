package com.example.demo.controllers.seguridad;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entities.seguridad.Permiso;
import com.example.demo.services.seguridad.PermisoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping(path ="/permisos")
@Tag(name = "Permiso", description = "Controlador para operaciones de Permiso")
public class PermisoController {
    private final PermisoService permisoService;

    public PermisoController(PermisoService permisoService){
        this.permisoService = permisoService;
    }

    @Operation(summary = "Obtiene todos los permisos pertenecientes a una categoría")
    @GetMapping("/{idCategoria}")
    @PreAuthorize("hasAuthority('GESTIONAR_ROLES')") 
    public ResponseEntity<?> obtenerPermisosSegunCategoria(@PathVariable Long idCategoria){
        List<Permiso> permisos = permisoService.obtenerPermisosDeUnaCategoria(idCategoria);
        return ResponseEntity.status(HttpStatus.OK).body(permisos);
    }

    @Operation(summary = "Obtiene todos los permisos pertenecientes a un rol")
    @GetMapping("/porRol/{idRol}")
    //@PreAuthorize("hasAuthority('GESTIONAR_ROLES')") 
    public ResponseEntity<?> obtenerPermisosSegunRol(@PathVariable Long idRol){
        List<Permiso> permisos = permisoService.obtenerPermisosDeUnRol(idRol);
        return ResponseEntity.status(HttpStatus.OK).body(permisos);
    }

    @Operation(summary = "Obtiene todos los permisos")
    @GetMapping("")
    @PreAuthorize("hasAuthority('GESTIONAR_ROLES')") 
    public ResponseEntity<?> obtenerTodosLosPermisos() {
        List<Permiso> permisos = permisoService.obtenerPermisos();
        return ResponseEntity.status(HttpStatus.OK).body(permisos);

    }

    @Operation(summary = "Obtiene todos los permisos ACTIVOS")
    @GetMapping("/activos")
    @PreAuthorize("hasAuthority('GESTIONAR_ROLES')") 
    public ResponseEntity<?> obtenerTodosLosPermisosActivos() {
        List<Permiso> permisos = permisoService.obtenerPermisosActivos();
        return ResponseEntity.status(HttpStatus.OK).body(permisos);

    }
}
