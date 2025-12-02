package com.example.demo.entities.oferta;

import com.example.demo.entities.Base;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "archivo_adjunto")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class ArchivoAdjunto extends Base {
    
    @NotBlank
    @Column(name = "enlace_archivo", nullable = false)
    private String enlaceArchivo;
}
