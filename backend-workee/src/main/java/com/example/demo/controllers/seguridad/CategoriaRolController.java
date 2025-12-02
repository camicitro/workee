package com.example.demo.controllers.seguridad;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entities.seguridad.CategoriaRol;
import com.example.demo.services.seguridad.CategoriaRolService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping(path ="/categoriasRoles")
@Tag(name = "CategoriaRol", description = "Controlador para operaciones de CategoriaRol")
public class CategoriaRolController {
    private final CategoriaRolService categoriaRolService;

    public CategoriaRolController(CategoriaRolService categoriaRolService){
        this.categoriaRolService = categoriaRolService;
    }

    @Operation(summary = "Obtiene todas las categorías de roles ACTIVAS")
    @GetMapping("")
    @PreAuthorize("hasAuthority('GESTIONAR_ROLES')")
    public ResponseEntity<?> obtenerCategoriasRoles(){
        List<CategoriaRol> categorias = categoriaRolService.obtenerCategoriasRoles();
        return ResponseEntity.status(HttpStatus.OK).body(categorias);
    }
}
