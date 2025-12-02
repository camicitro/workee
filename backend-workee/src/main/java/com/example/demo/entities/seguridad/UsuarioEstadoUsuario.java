package com.example.demo.entities.seguridad;


import com.example.demo.entities.Base;
import com.example.demo.entities.params.EstadoUsuario;

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
@Table(name = "usuario_estado_usuario")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioEstadoUsuario extends Base{
    
    @ManyToOne() 
    @JoinColumn(name = "id_estado_usuario")
    @NotNull
    private EstadoUsuario estadoUsuario;
}
