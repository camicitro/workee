package com.example.demo.controllers.empresa;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dtos.empresa.EmpresaRequestDTO;
import com.example.demo.entities.empresa.Empresa;
import com.example.demo.services.BajaOrquestadorService;
import com.example.demo.services.empresa.EmpresaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/empresas")
@Tag(name = "Empresa", description = "Controlador para operaciones CRUD de Empresa")
public class EmpresaController {

    private final EmpresaService empresaService;
    private final BajaOrquestadorService bajaOrquestadorService;

    public EmpresaController(EmpresaService empresaService, BajaOrquestadorService bajaOrquestadorService) {
        this.empresaService = empresaService;
        this.bajaOrquestadorService = bajaOrquestadorService;
    }

    @Operation(summary = "Modificar perfil de administrador empresa")
    @PutMapping("/modificarPerfil/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_MI_PERFIL')") 
    public ResponseEntity<?> modificarEmpresa(@PathVariable Long id, @RequestBody EmpresaRequestDTO empresaRequestDTO){
        Empresa empresaModificada = empresaService.modificarEmpresa(id, empresaRequestDTO);
        return ResponseEntity.status(HttpStatus.OK).body(empresaModificada);
    }

    @Operation(summary = "Ver detalle de una empresa segun su ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('GESTIONAR_MI_PERFIL', 'BUSCAR_EMPRESAS', 'POSTULAR_OFERTA', 'HABILITACION_EMPRESA')")
    public ResponseEntity<?> visualizarDetalleEmpresa(@PathVariable Long id){
        Empresa empresa = empresaService.findById(id);
        return ResponseEntity.status(HttpStatus.OK).body(empresa);
    }

    @Operation(summary = "Elimina una cuenta de empresa y todo lo relacionado a ella")
    @DeleteMapping("/{idEmpresa}")
    @PreAuthorize("hasAuthority('GESTIONAR_MI_PERFIL')") 
    public ResponseEntity<?> eliminarEmpresa(@PathVariable Long idEmpresa){
        bajaOrquestadorService.darDeBajaEmpresaYRelacionados(idEmpresa);
        return ResponseEntity.status(HttpStatus.OK).body("Cuenta de empresa eliminada correctamente");
    }


    @Operation(summary = "Obtener el ID de una empresa por el correo del usuario") //Maxi aca esta el metodo que pediste pero no le puse permiso pq no sabia q necesitabas
    @GetMapping("/idEmpresaPorCorreo/{correoUsuario}")
    @PreAuthorize("hasAuthority('GESTION_OFERTAS')")
    public ResponseEntity<?> obtenerIdEmpresaSegunCorreoUsuario(@PathVariable String correoUsuario){
        Long idEmpresa = empresaService.obtenerIdEmpresaSegunCorreoUsuario(correoUsuario);

        return ResponseEntity.status(HttpStatus.OK).body(idEmpresa);

    }
}


