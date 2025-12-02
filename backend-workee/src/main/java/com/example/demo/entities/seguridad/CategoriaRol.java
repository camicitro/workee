package com.example.demo.entities.seguridad;

import java.util.List;

import com.example.demo.entities.Base;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "categoria_rol")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoriaRol extends Base{

    @NotNull
    @Column(name = "nombre_categoria_rol")
    private String nombreCategoriaRol;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "id_categoria_rol")
    private List<CategoriaRolPermiso> categoriaRolPermisoList;
}
