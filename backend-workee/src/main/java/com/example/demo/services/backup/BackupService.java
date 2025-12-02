package com.example.demo.services.backup;

import java.util.List;

public interface BackupService {
    public List<String> listarBackups();

    public String generarBackup();

    public String restaurarBackup(String nombreBackup);
}
