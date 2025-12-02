package com.example.demo.entities.params;
import jakarta.persistence.Column;

import jakarta.validation.constraints.NotNull;

import com.example.demo.entities.Base;

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
@Table(name = "provincia")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Provincia extends Base {
    @NotNull
    @Column(name = "nombre_provincia")
    private String nombreProvincia;

    @ManyToOne()
    @JoinColumn(name = "id_pais")
    private Pais pais;
}
