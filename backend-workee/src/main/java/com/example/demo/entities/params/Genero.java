package com.example.demo.entities.params;


import jakarta.validation.constraints.NotNull;

import com.example.demo.entities.Base;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "genero")
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Genero extends Base {
    @NotNull
    @Column(name = "nombre_genero")
    private String nombreGenero;

}
