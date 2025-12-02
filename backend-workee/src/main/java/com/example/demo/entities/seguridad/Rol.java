package com.example.demo.entities.seguridad;

import java.util.List;

import com.example.demo.entities.Base;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "rol")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Rol extends Base{
    
    @NotNull
    @Column(name = "nombre_rol")
    private String nombreRol;

    @ManyToOne()
    @JoinColumn(name = "id_categoria_rol")
    @NotNull
    private CategoriaRol categoriaRol;


    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "id_rol")
    private List<PermisoRol> permisoRolList;

    @Column(name = "codigo_rol", unique = true)
    private String codigoRol;
}
