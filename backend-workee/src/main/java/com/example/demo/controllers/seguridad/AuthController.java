package com.example.demo.controllers.seguridad;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dtos.candidato.CandidatoRequestDTO;
import com.example.demo.dtos.empresa.EmpresaRequestDTO;
import com.example.demo.dtos.login.LoginRequestDTO;
import com.example.demo.dtos.seguridad.CorreoRequestDTO;
import com.example.demo.dtos.seguridad.RecuperarContraseniaDTO;
import com.example.demo.dtos.seguridad.TokenRequestDTO;
import com.example.demo.entities.candidato.Candidato;
import com.example.demo.entities.empresa.Empresa;
import com.example.demo.services.candidato.CandidatoService;
import com.example.demo.services.empresa.EmpresaService;
import com.example.demo.services.seguridad.UsuarioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping(path ="/auth")
@Tag(name = "Auth", description = "Controlador para operaciones de seguridad")
public class AuthController {
    private final UsuarioService usuarioService;
    private final CandidatoService candidatoService;
    private final EmpresaService empresaService;

    public AuthController(UsuarioService usuarioService, CandidatoService candidatoService, EmpresaService empresaService){
        this.usuarioService = usuarioService;
        this.candidatoService = candidatoService;
        this.empresaService = empresaService;
    }

    @Operation(summary = "Enviar correo para que usuario recupere su contraseña")
    @PutMapping("/recuperarContrasenia")
    public ResponseEntity<?> solicitarRecuperarContrasenia(@RequestBody CorreoRequestDTO correoRequestDTO){
        this.usuarioService.solicitarRecuperarContrasenia(correoRequestDTO.getCorreo());
        return ResponseEntity.status(HttpStatus.OK).body("Revise su correo para poder recuperar su contraseña");
    }

    @Operation(summary = "Usuario recupera su contraseña")
    @PutMapping("/confirmarRecuperacionContrasenia")
    @Parameter(name = "token", description = "Token recibido por correo", required = true)
    public ResponseEntity<?> confirmarRecuperacionContrasenia(@RequestParam String token, @RequestBody RecuperarContraseniaDTO recuperarContraseniaDTO){
        this.usuarioService.confirmarRecuperacionContrasenia(token, recuperarContraseniaDTO);
        return ResponseEntity.status(HttpStatus.OK).body(Map.of("mensaje", "Contraseña recuperada exitosamente"));
    } //AVISO PARA CUANDO HAGAN EL FRONT: En este caso si va RequestParam pq el path es http://localhost:4200/nuevaContrasenia?token=...

    @Operation(summary = "Usuario verifica su cuenta")
    @PutMapping("/confirmarCuenta")
    public ResponseEntity<?> confirmarRecuperacionContrasenia(@RequestBody TokenRequestDTO tokenRequestDTO){
        Map<String, String> response = new HashMap<>();
        response.put("estado", "habilitado");
        response.put("mensaje", "Cuenta verificada exitosamente");
        this.usuarioService.confirmarTokenCandidato(tokenRequestDTO.getToken());
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Permite a un usuario iniciar sesión")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequestDTO) { 
        String token = usuarioService.login(loginRequestDTO);
        return ResponseEntity.status(HttpStatus.OK).body(token);
    }

    @Operation(summary = "Permite a un candidato registrarse")
    @PostMapping("/registroCandidato")
    public ResponseEntity<?> registrarCandidato(@Valid @RequestBody CandidatoRequestDTO candidatoRequestDTO){
        Candidato candidato = candidatoService.crearCandidato(candidatoRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(candidato);
    }

    @Operation(summary = "Permiste a una empresa registrarse")
    @PostMapping("registroEmpresa")
    public ResponseEntity<?> registrarEmpresa(@Valid @RequestBody EmpresaRequestDTO empresaRequestDTO){
        Empresa empresaNueva = empresaService.crearEmpresa(empresaRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(empresaNueva);
    }
}
