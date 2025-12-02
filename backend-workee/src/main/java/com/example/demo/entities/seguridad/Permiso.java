package com.example.demo.entities.seguridad;

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
@Table(name = "permiso")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Permiso extends Base{
    @NotNull
    @Column(name = "nombre_permiso")
    private String nombrePermiso;

    @NotNull
    @Column(name = "codigo_permiso")
    private String codigoPermiso;
}
