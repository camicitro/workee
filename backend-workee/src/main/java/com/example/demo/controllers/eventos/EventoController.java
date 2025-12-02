package com.example.demo.controllers.eventos;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dtos.eventos.EventoRequestDTO;
import com.example.demo.entities.eventos.Evento;
import com.example.demo.services.eventos.EventoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/eventos")
@Tag(name = "Evento", description = "Controlador para operaciones de Evento")

public class EventoController {
    
    private final EventoService eventoService;

    public EventoController(EventoService eventoService) {
        this.eventoService = eventoService;
    }

    @Operation(summary = "Crear un nuevo evento")
    @PostMapping("")
    @PreAuthorize("hasAuthority('GESTIONAR_EVENTOS')")
    public ResponseEntity<Evento> crearEvento(/*@Valid*/ @RequestBody EventoRequestDTO eventoDTO) {
        Evento nuevoEvento = eventoService.crearEvento(eventoDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoEvento);
    }

    @Operation(summary = "Modificar un evento por su ID")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_EVENTOS')")
    public ResponseEntity<Evento> modificarEvento(@PathVariable("id") Long idEvento, @RequestBody EventoRequestDTO eventoDTO) {
        Evento eventoActualizado = eventoService.modificarEvento(idEvento, eventoDTO);
        return ResponseEntity.ok().body(eventoActualizado);
    }

    @Operation(summary = "Eliminar un evento por su ID")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('GESTIONAR_EVENTOS')")
    public ResponseEntity<?> eliminarEvento(@PathVariable("id") Long idEvento) {
        eventoService.delete(idEvento);
        return ResponseEntity.status(HttpStatus.OK).body("Evento eliminado correctamente");
    }

    @Operation(summary = "Obtener un evento por su ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VER_EVENTOS')")
    public ResponseEntity<Evento> obtenerEventoPorId(@PathVariable("id") Long idEvento) {
        Evento evento = eventoService.findById(idEvento);
        return ResponseEntity.ok().body(evento);
    }

    @Operation(summary = "Obtener todos los eventos de un Usuario")
    @GetMapping("/usuario/{idUsuario}")
    @PreAuthorize("hasAuthority('VER_EVENTOS')")
    public ResponseEntity<List<Evento>> obtenerEventosPorUsuario(@PathVariable("idUsuario") Long idUsuario) {
        List<Evento> listaEventos = eventoService.obtenerEventosPorUsuario(idUsuario);
        return ResponseEntity.ok().body(listaEventos);
    }

    @Operation(summary = "Obtener todos los eventos de una Empresa")
    @GetMapping("/empresa/{idEmpresa}")
    @PreAuthorize("hasAuthority('VER_EVENTOS_EMPRESA')")
    public ResponseEntity<List<Evento>> obtenerEventosPorEmpresa(@PathVariable("idEmpresa") Long idEmpresa) {
        List<Evento> listaEventos = eventoService.obtenerEventosPorEmpresa(idEmpresa);
        return ResponseEntity.ok().body(listaEventos);
    }    
    @GetMapping("/postulacion/{idPostulacion}")
    @PreAuthorize("hasAuthority('VER_EVENTOS') or hasAuthority('VER_EVENTOS_EMPRESA') or hasAuthority('GESTIONAR_POSTULACION')")
    public ResponseEntity<List<Evento>> obtenerEventosPorPostulacion(@PathVariable Long idPostulacion) {
        List<Evento> eventos = eventoService.obtenerEventosPorPostulacion(idPostulacion);
        return ResponseEntity.ok(eventos);
    }

}
