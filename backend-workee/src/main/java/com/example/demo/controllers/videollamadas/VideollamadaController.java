package com.example.demo.controllers.videollamadas;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entities.videollamadas.Videollamada;
import com.example.demo.services.videollamadas.VideollamadaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping(path = "/videollamadas")
@Tag(name = "Videollamadas", description = "Controlador para las videollamadas")
public class VideollamadaController {
    private final VideollamadaService videollamadaService;

    public VideollamadaController(VideollamadaService videollamadaService){
        this.videollamadaService = videollamadaService;
    }
   
    // ****** ESTE EN REALIDAD NO SE USA PQ LA VIDEOLLAMADA SE CREA DESDE EL EVENTO, PERO LO AGREGO PARA PODER HACER ALGUNAS PRUEBAS***********
    /*@Operation(summary = "Crear una videollamada")
    @PostMapping("")
    @PreAuthorize("hasAuthority('VER_EVENTOS') or hasAuthority('GESTIONAR_EVENTOS')")
    public ResponseEntity<?> crearVideollamada(@RequestBody EventoRequestDTO datosEvento) {
        Videollamada videollamada = videollamadaService.crearVideollamada(datosEvento);
        return ResponseEntity.ok().body(videollamada);
    }*/

    @Operation(summary = "Finalizar una videollamada")
    @PutMapping("/finalizar/{idVideollamada}")
    @PreAuthorize("hasAuthority('VER_EVENTOS') or hasAuthority('GESTIONAR_EVENTOS')")
    public ResponseEntity<?> finalizarVideollamada(@PathVariable Long idVideollamada) {
        Videollamada videollamada = videollamadaService.finalizarVideollamada(idVideollamada);
        return ResponseEntity.ok().body(videollamada);
    }

    @Operation(summary = "Iniciar una videollamada")
    @PutMapping("/iniciar/{idVideollamada}")
    @PreAuthorize("hasAuthority('VER_EVENTOS') or hasAuthority('GESTIONAR_EVENTOS')")
    public ResponseEntity<?> iniciarVideollamada(@PathVariable Long idVideollamada) {
        Videollamada videollamada = videollamadaService.iniciarVideollamada(idVideollamada);
        return ResponseEntity.ok().body(videollamada);
    }
}
