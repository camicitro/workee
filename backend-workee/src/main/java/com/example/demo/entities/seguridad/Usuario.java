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
@Table(name = "usuario")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Usuario extends Base{
    @NotNull
    @Column(name = "correo_usuario")
    private String correoUsuario;

    @NotNull
    @Column(name = "contrasenia_usuario")
    private String contraseniaUsuario;

    @NotNull
    @Column(name = "url_foto")
    private String urlFotoUsuario;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "id_usuario")
    private List<UsuarioEstadoUsuario> usuarioEstadoList;
}
