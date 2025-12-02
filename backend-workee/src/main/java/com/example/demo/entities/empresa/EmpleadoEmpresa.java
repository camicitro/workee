package com.example.demo.entities.empresa;


import com.example.demo.entities.Base;
import com.example.demo.entities.seguridad.Usuario;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "empleado_empresa")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmpleadoEmpresa extends Base {

    @Column(name = "apellido_empleado_empresa")
    @NotNull
    private String apellidoEmpleadoEmpresa;

    @Column(name = "nombre_empleado_empresa")
    @NotNull
    private String nombreEmpleadoEmpresa;

    @Column(name = "puesto_empleado_empresa")
    @NotNull
    private String puestoEmpleadoEmpresa;

    @ManyToOne()
    @JoinColumn(name = "id_empresa")
    @NotNull
    private Empresa empresa;

    @OneToOne() //usamos el cascade = CascadeType.ALL???? yo no lo pondria por si cambia de rol (segun el chat es acoplamiento fuerte usarlo)
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;
}
