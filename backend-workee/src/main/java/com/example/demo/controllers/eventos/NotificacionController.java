package com.example.demo.controllers.eventos;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entities.eventos.Notificacion;
import com.example.demo.services.eventos.NotificacionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/notificaciones")
@Tag(name = "Notificacion", description = "Controlador para operaciones de Notificacion")
public class NotificacionController {

    private final NotificacionService notificacionService;

    public NotificacionController(NotificacionService notificacionService) {
        this.notificacionService = notificacionService;
    }

    //Obtener notificacion por ID
    @Operation(summary = "Obtener notificación por ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('VER_NOTIFICACIONES')")
    public ResponseEntity<Notificacion> obtenerNotificacionPorId(@PathVariable Long id) {
        Notificacion notificacion = notificacionService.findById(id);
        return ResponseEntity.ok().body(notificacion);
    }

    //Obtener notificaciones pendientes (a mostrar en el Swal)
    @Operation(summary = "Obtener notificaciones pendientes por usuario")
    @GetMapping("/pendientes/usuario/{id}")
    @PreAuthorize("hasAuthority('VER_NOTIFICACIONES')")
    public ResponseEntity<List<Notificacion>> obtenerNotificacionesPendientesPorUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(notificacionService.obtenerNotificacionesPendientesPorUsuario(id));
    }

    //Obtener todas las notificaciones del usuario (para el listado de notificaciones)
    @Operation(summary = "Obtener notificaciones por usuario")
    @GetMapping("/usuario/{id}")
    @PreAuthorize("hasAuthority('VER_NOTIFICACIONES')")
    public ResponseEntity<List<Notificacion>> obtenerNotificacionPorUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(notificacionService.obtenerNotificacionesPorUsuario(id));
    }
    
    //Marcar como leída (cuando se visualiza en la sección de Notificaciones)
    @Operation(summary = "Marcar notificación como leída")
    @PutMapping("/leida/{id}")
    @PreAuthorize("hasAuthority('VER_NOTIFICACIONES')")
    public ResponseEntity<Void> marcarNotificacionComoLeida(@PathVariable Long id) {
        notificacionService.marcarComoLeida(id);
        return ResponseEntity.ok().build();
    }
    
    //Marcar como enviada (despues que se muestra el Swal de la notificación)
    @Operation(summary = "Marcar notificación como enviada")
    @PutMapping("/enviada/{id}")
    @PreAuthorize("hasAuthority('VER_NOTIFICACIONES')")
    public ResponseEntity<Void> marcarNotificacionComoEnviada(@PathVariable Long id) {
        notificacionService.marcarComoEnviada(id);
        return ResponseEntity.ok().build();
    }
}
