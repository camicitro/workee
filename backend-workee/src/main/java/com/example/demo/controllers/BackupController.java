package com.example.demo.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.services.backup.BackupService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;


@RestController
@RequestMapping(path ="/backup")
@Tag(name = "Backup", description = "Controlador para operaciones de backup y recuperación")
public class BackupController {
    private final BackupService backupService;

    public BackupController(BackupService backupService) {
        this.backupService = backupService;
    }

    @Operation(summary = "Listar los backups disponibles")
    @GetMapping("/listarBackups")
    @PreAuthorize("hasAuthority('BACKUP')")
    public ResponseEntity<?> listarBackups() {
        List<String> backups = backupService.listarBackups();
        return ResponseEntity.status(HttpStatus.OK).body(backups);
    }

    @Operation(summary = "Genera un backup de la base de datos")
    @PostMapping("/generarBackup")
    @PreAuthorize("hasAuthority('BACKUP')")
    public ResponseEntity<?> generarBackup() {
        String mensaje = backupService.generarBackup();
        return ResponseEntity.status(HttpStatus.OK).body(mensaje);
    }

    @Operation(summary = "Restaurar un backup de la base de datos")
    @PostMapping("/restaurarBackup/{nombreBackup}")
    @PreAuthorize("hasAuthority('BACKUP')")
    public ResponseEntity<?> restaurarBackup(@PathVariable String nombreBackup) {
        String mensaje = backupService.restaurarBackup(nombreBackup);
        return ResponseEntity.status(HttpStatus.OK).body(mensaje);
    }
    
}
