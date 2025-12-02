package com.example.demo.controllers.seguridad;

import java.util.List;
import java.util.Map;
import java.util.Optional;

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

import com.example.demo.dtos.seguridad.ActualizarContraseniaDTO;
import com.example.demo.entities.candidato.Candidato;
import com.example.demo.entities.empresa.EmpleadoEmpresa;
import com.example.demo.entities.empresa.Empresa;
import com.example.demo.dtos.seguridad.FiltrosUsuariosRequestDTO;
import com.example.demo.dtos.seguridad.UsuarioResponseDTO;
import com.example.demo.entities.seguridad.Usuario;
import com.example.demo.services.BajaOrquestadorService;
import com.example.demo.services.candidato.CandidatoService;
import com.example.demo.services.empresa.EmpleadoEmpresaService;
import com.example.demo.services.empresa.EmpresaService;
import com.example.demo.services.seguridad.UsuarioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping(path ="/usuarios")
@Tag(name = "Usuario", description = "Controlador para operaciones de Usuario")

public class UsuarioController {
    private final UsuarioService usuarioService;
    private final BajaOrquestadorService bajaOrquestadorService;
    private final EmpleadoEmpresaService empleadoEmpresaService;
    private final EmpleadoEmpresaService empleadoService;
    private final EmpresaService empresaService;
    private final CandidatoService candidatoService;

    public UsuarioController(UsuarioService usuarioService, BajaOrquestadorService bajaOrquestadorService, EmpleadoEmpresaService empleadoEmpresaService, EmpresaService empresaService, CandidatoService candidatoService, EmpleadoEmpresaService empleadoService){
        this.usuarioService = usuarioService;
        this.bajaOrquestadorService = bajaOrquestadorService;
        this.empleadoEmpresaService = empleadoEmpresaService;
        this.empresaService = empresaService;
        this.candidatoService = candidatoService;
        this.empleadoService = empleadoService;
    }

    

    @Operation(summary = "Trae a todos los usuarios que se encuentran activos")
    @GetMapping("")
    @PreAuthorize("hasAuthority('GESTIONAR_USUARIOS')") 
    public ResponseEntity<?> buscarUsuariosActivos(){
        List<UsuarioResponseDTO> usuarios = usuarioService.buscarUsuariosActivos();
        return ResponseEntity.status(HttpStatus.OK).body(usuarios);
    }

    @Operation(summary = "Trae a todos los usuarios que se encuentran activos según el rol ingresado")
    @PutMapping("/porRol")
    @PreAuthorize("hasAuthority('GESTIONAR_USUARIOS')") 
    public ResponseEntity<?> buscarUsuariosActivosPorRol(@Valid @RequestBody FiltrosUsuariosRequestDTO filtroUsuario){
        List<UsuarioResponseDTO> usuarios = usuarioService.buscarUsuariosActivosPorRol(filtroUsuario.getIdsRol());
        return ResponseEntity.status(HttpStatus.OK).body(usuarios);
    }

    @Operation(summary = "Para dar de baja un usuario y su entidad relacionada")
    @DeleteMapping("/{idUsuario}")
    @PreAuthorize("hasAuthority('GESTIONAR_USUARIOS')") 
    public ResponseEntity<?> darDeBajaUsuario(@PathVariable Long idUsuario){
        this.bajaOrquestadorService.darDeBajaUsuarioYEntidadRelacionada(idUsuario);
        return ResponseEntity.status(HttpStatus.OK).body("Usuario dado de baja correctamente");
    }

    @Operation(summary = "Modificar el rol de un usuario")
    @PutMapping("/modificarRol/{idUsuario}")
    @PreAuthorize("hasAuthority('GESTIONAR_USUARIOS')") 
    public ResponseEntity<?> modificarRolDeUsuario(@PathVariable Long idUsuario, @RequestBody Long idRol){
        usuarioService.modificarRolUsuario(idUsuario, idRol);
        return ResponseEntity.status(HttpStatus.OK).body(Map.of("mensaje", "Contraseña recuperada exitosamente"));
    }

    @Operation(summary = "Visualizar detalle de usuario")
    @GetMapping("/{idUsuario}")
    @PreAuthorize("hasAuthority('GESTIONAR_USUARIOS')") 
    public ResponseEntity<?> visualizarDetalleUsuario(@PathVariable Long idUsuario){
        UsuarioResponseDTO usuario = usuarioService.visualizarDetalleUsuario(idUsuario);
        return ResponseEntity.status(HttpStatus.OK).body(usuario);
    }

    @Operation(summary = "Permite a un usuario ver su propio perfil")
    @GetMapping("/miPerfil")
    @PreAuthorize("hasAuthority('GESTIONAR_MI_PERFIL')")
    public ResponseEntity<?> verPerfilUsuario(){
        Usuario usuario = usuarioService.obtenerUsuarioAutenticado();

        if (empleadoEmpresaService.existeEmpleadoPorUsuarioId(usuario.getId())) {
            return ResponseEntity.ok(empleadoEmpresaService.buscarEmpleadoEmpresaPorUsuarioId(usuario.getId()).get());
        } else if (empresaService.existeEmpresaPorUsuarioId(usuario.getId())) {
            return ResponseEntity.ok(empresaService.buscarEmpresaPorIdUsuario(usuario.getId()).get());
        } else if (candidatoService.existeCandidatoPorUsuarioId(usuario.getId())) {
            return ResponseEntity.ok(candidatoService.traerPerfilCandidatoPorUsuario(usuario.getId()));//TODO: CAMBIAR
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No tiene perfil asociado.");
        }
    }

    @Operation(summary = "Permite a un usuario modificar su contraseña desde su perfil")
    @PutMapping("/actualizarContrasenia/{idUsuario}")
    @PreAuthorize("hasAuthority('GESTIONAR_MI_PERFIL')")
    public ResponseEntity<?> actualizarContrasenia(@RequestBody ActualizarContraseniaDTO actualizarContraseniaDTO, @PathVariable Long idUsuario){
        usuarioService.actualizarContraseniaUsuario(idUsuario, actualizarContraseniaDTO.getContraseniaNueva(), actualizarContraseniaDTO.getRepetirContrasenia(), actualizarContraseniaDTO.getContraseniaActual());
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    
    @Operation(summary = "Visualizar detalle de usuario")
    @GetMapping("/rolViejo/{idUsuario}")
    //@PreAuthorize("hasAuthority('GESTIONAR_USUARIOS')") 
    public ResponseEntity<?> obtenerRolMasViejo(@PathVariable Long idUsuario){
        String codigoRol = usuarioService.obtenerCodigoRolMasViejo(idUsuario);
        return ResponseEntity.status(HttpStatus.OK).body(Map.of("codigoRol", codigoRol));
    }

    @Operation(summary = "Obtener ID de usuario por su correo")
    @GetMapping("/idPorCorreo/{correo}")
    //@PreAuthorize("hasAuthority('GESTIONAR_USUARIOS')") 
    public ResponseEntity<?> obtenerIdPorCorreo(@PathVariable String correo){
        Long id = usuarioService.obtenerIdUsuarioPorCorreo(correo);
        return ResponseEntity.status(HttpStatus.OK).body(Map.of("id", id));
    }


    ///MAS METODOS QUE ME PIDE EL MAXI NO SE PARA QUE :D
    @Operation(summary = "Obtener candidato por ID usuario")
    @GetMapping("/candidatoPorIdUsuario/{idUsuario}")
    //@PreAuthorize("hasAuthority('GESTIONAR_USUARIOS')") 
    public ResponseEntity<?> obtenerCandidato(@PathVariable Long idUsuario){
        Optional<Candidato> candidato = candidatoService.buscarCandidatoPorIdUsuario(idUsuario);
        if(candidato.isPresent()){
            return ResponseEntity.status(HttpStatus.OK).body(candidato.get());
        }
        else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "No se encontró el candidato buscado por el ID usuario"));
        }
    }

    @Operation(summary = "Obtener empresa por ID usuario")
    @GetMapping("/empresaPorIdUsuario/{idUsuario}")
    //@PreAuthorize("hasAuthority('GESTIONAR_USUARIOS')") 
    public ResponseEntity<?> obtenerEmpresa(@PathVariable Long idUsuario){
        Optional<Empresa> empresa = empresaService.buscarEmpresaPorIdUsuario(idUsuario);
        if(empresa.isPresent()){
            return ResponseEntity.status(HttpStatus.OK).body(empresa.get());
        }
        else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "No se encontró la empresa buscada por el ID usuario"));
        }
    }

    @Operation(summary = "Obtener empleado por ID usuario")
    @GetMapping("/empleadoPorIdUsuario/{idUsuario}")
    //@PreAuthorize("hasAuthority('GESTIONAR_USUARIOS')") 
    public ResponseEntity<?> obtenerEmpleado(@PathVariable Long idUsuario){
        Optional<EmpleadoEmpresa> empleado = empleadoService.buscarEmpleadoPorIdUsuario(idUsuario);
        if(empleado.isPresent()){
            return ResponseEntity.status(HttpStatus.OK).body(empleado.get());
        }
        else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "No se encontró la empresa buscada por el ID usuario"));
        }
    }

}