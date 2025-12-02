package com.example.demo.dtos.empresa;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmpleadoEmpresaRequestDTO {

    @NotBlank(message = "El nombre del empleado es obligatorio")
    private String nombreEmpleadoEmpresa;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellidoEmpleadoEmpresa;

    @NotBlank(message = "El puesto es obligatorio")
    private String puestoEmpleadoEmpresa;

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Email(message = "Debe ser un correo válido")
    private String correoEmpleadoEmpresa;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String contrasenia;

    @NotBlank(message = "Debes repetir la contraseña")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String repetirContrasenia;

    @NotNull(message = "La empresa es obligatoria")
    private Long idEmpresa;

    private String urlFotoPerfil;

    private String contraseniaActual;
} 
