package com.example.demo.entities.params;


import com.example.demo.entities.Base;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "estado_oferta")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class EstadoOferta extends Base {

    @NotNull
    @Column(name = "codigo", unique = true, nullable = false) // ABIERTA/CERRADA/FINALIZADA
    private String codigo;

    @NotNull
    @Column(name = "nombre_estado_oferta")
    private String nombreEstadoOferta;

}