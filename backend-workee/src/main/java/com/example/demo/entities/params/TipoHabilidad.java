package com.example.demo.entities.params;
import jakarta.persistence.Column;

import jakarta.validation.constraints.NotNull;

import com.example.demo.entities.Base;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tipo_habilidad")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TipoHabilidad extends Base {
    @NotNull
    @Column(name = "nombre_tipo_habilidad")
    private String nombreTipoHabilidad; 

    @NotNull
    @Column(name = "codigo_tipo_habilidad", unique = true)
    private String codigoTipoHabilidad;

}
