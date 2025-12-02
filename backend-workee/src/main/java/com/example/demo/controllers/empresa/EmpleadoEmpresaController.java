package com.example.demo.controllers.empresa;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dtos.empresa.EmpleadoEmpresaRequestDTO;
import com.example.demo.entities.empresa.EmpleadoEmpresa;
import com.example.demo.services.empresa.EmpleadoEmpresaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping(path ="/empleadosEmpresa")
@Tag(name = "EmpleadoEmpresa", description = "Controlador para operaciones de EmpleadoEmpresa")
public class EmpleadoEmpresaController {
    private final EmpleadoEmpresaService empleadoEmpresaService;

    public EmpleadoEmpresaController(EmpleadoEmpresaService empleadoEmpresaService) {
        this.empleadoEmpresaService = empleadoEmpresaService;
    }

    @Operation(summary = "Crear un empleado empresa")
    @PostMapping("")
    @PreAuthorize("hasAuthority('GESTIONAR_EMPLEADOS')")
    public ResponseEntity<?> crearEmpleado(@Valid @RequestBody EmpleadoEmpresaRequestDTO empleadoEmpresaRequestDTO){
        EmpleadoEmpresa nuevoEmpleadoEmpresa = empleadoEmpresaService.darDeAltaEmpleado(empleadoEmpresaRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoEmpleadoEmpresa);
    }

    @Operation(summary = "Un EmpleadoEmpresa actualiza su perfil")
    @PutMapping("/actualizarPerfilPropio/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_MI_PERFIL')")
    public ResponseEntity<?> actualizarEmpleadoComoEmpleado(@RequestBody EmpleadoEmpresaRequestDTO empleadoEmpresaRequestDTO, @PathVariable Long id){
        EmpleadoEmpresa empleadoEmpresa = empleadoEmpresaService.modificarEmpleado(empleadoEmpresaRequestDTO,true, id);
        return ResponseEntity.status(HttpStatus.CREATED).body(empleadoEmpresa);
    }

    @Operation(summary = "Un Administrador de Empresa actualiza el perfil de un Empleado")
    @PutMapping("/actualizarPerfilPorAdmin/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_EMPLEADOS')")
    public ResponseEntity<?> actualizarEmpleadoComoAdminEmpresa(@RequestBody EmpleadoEmpresaRequestDTO empleadoEmpresaRequestDTO, @PathVariable Long id){
        EmpleadoEmpresa empleadoEmpresa = empleadoEmpresaService.modificarEmpleado(empleadoEmpresaRequestDTO,false, id);
        return ResponseEntity.status(HttpStatus.CREATED).body(empleadoEmpresa);
    }


    @Operation(summary = "Trae todos los empleados ACTIVOS de una empresa")
    @GetMapping("/traerActivos/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_EMPLEADOS') or hasAuthority('GESTION_OFERTAS')")
    public ResponseEntity<?> visualizarEmpleadosActivos(@PathVariable Long id){
        List<EmpleadoEmpresa> empleados = empleadoEmpresaService.visualizarEmpleados(id);
        return ResponseEntity.status(HttpStatus.OK).body(empleados);
    }

    @Operation(summary = "Trae todos los empleados (activos y no activos) de una empresa")
    @GetMapping("/traerTodos/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_EMPLEADOS') or hasAuthority('GESTION_OFERTAS')")
    public ResponseEntity<?> visualizarEmpleados(@PathVariable Long id){
        List<EmpleadoEmpresa> empleados = empleadoEmpresaService.visualizarTodosLosEmpleadosDeUnaEmpresa(id);
        return ResponseEntity.status(HttpStatus.OK).body(empleados);
    }

    @Operation(summary = "Dice la cantidad de empleados ACTIVOS que tiene una empresa")
    @GetMapping("/contarEmpleados/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_EMPLEADOS')")
    public ResponseEntity<?> contarCantidadEmpleadosDeEmpresa(@PathVariable Long id){
        Long cantidadEmpleados = empleadoEmpresaService.contarEmpleadosDeEmpresa(id);
        return ResponseEntity.status(HttpStatus.OK).body(cantidadEmpleados);
    }


    @Operation(summary = "Trae a un EmpleadoEmpresa por su ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_EMPLEADOS') or hasAuthority('GESTIONAR_MI_PERFIL')") 
    public ResponseEntity<?> visualizarDatosEmpleado(@PathVariable Long id){
        EmpleadoEmpresa empleado = empleadoEmpresaService.findById(id);
        return ResponseEntity.status(HttpStatus.OK).body(empleado);
    }

    @Operation(summary = "Administrador empresa da de baja un empelado empresa")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_EMPLEADOS')") 
    public ResponseEntity<?> darDeBajaEmpleado(@PathVariable Long id){
        Boolean seDioBaja = empleadoEmpresaService.darDeBajaEmpleadoEmpresa(id);
        return ResponseEntity.status(HttpStatus.OK).body(seDioBaja);
    }

    @Operation(summary = "Administrador empresa da de alta un empelado empresa")
    @PutMapping("/habilitar/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_EMPLEADOS')") 
    public ResponseEntity<?> habilitarEmpleadoEmpresa(@PathVariable Long id){
        Boolean seDioAlta = empleadoEmpresaService.habilitarEmpleadoEmpresa(id);
        return ResponseEntity.status(HttpStatus.OK).body(seDioAlta);
    }
}


