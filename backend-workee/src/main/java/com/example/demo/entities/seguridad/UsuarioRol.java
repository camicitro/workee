package com.example.demo.entities.seguridad;

import com.example.demo.entities.Base;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "usuario_rol")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioRol extends Base {
    @ManyToOne()
    @JoinColumn(name = "id_rol")
    @NotNull
    private Rol rol;

    @ManyToOne()
    @JoinColumn(name = "id_usuario")
    @NotNull
    private Usuario usuario;
}
