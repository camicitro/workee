package com.example.demo.entities.params;

import jakarta.persistence.Column;

import jakarta.validation.constraints.NotNull;

import com.example.demo.entities.Base;
import com.example.demo.entities.empresa.Empresa;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "etapa")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Etapa extends Base {
    
    @NotNull
    @Column(name = "nombre_etapa")
    private String nombreEtapa;
    
    @NotNull
    @Column(name = "descripcion_etapa")
    private String descripcionEtapa;

    @ManyToOne
    @JoinColumn(name = "id_empresa", nullable = true)
    private Empresa empresa;

    @NotNull
    @Column(name = "es_predeterminada")
    private Boolean esPredeterminada;

    @NotNull
    @Column(name = "codigo_etapa", unique = true)
    private String codigoEtapa;
}

