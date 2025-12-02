package com.example.demo.dtos.empresa;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmpresaRequestDTO {

    private String sitioWebEmpresa;

    @NotBlank(message = "El nombre de la empresa no puede estar vacío")
    private String nombreEmpresa;

    @NotBlank(message = "La descripcion de la empresa no puede estar vacía")
    private String descripcionEmpresa;

    @NotNull(message = "El teléfono de la empresa no puede estar vacío")
    private String telefonoEmpresa;

    @NotBlank(message = "La dirección de la empresa no puede estar vacía")
    private String direccionEmpresa;

    @NotNull(message = "El rubro de la empresa no puede estar vacío")
    private Long idRubro;

    @NotBlank(message = "El número de identificación fiscal no puede estar vacío")
    private String numeroIdentificacionFiscal;


    @NotBlank(message = "El correo electrónico de la empresa no puede estar vacío")
    private String emailEmpresa;

    @NotBlank(message = "La contraseña no puede estar vacía")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String contrasenia;

    @NotBlank(message = "La contraseña no puede estar vacía")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String repetirContrasenia;

    @NotNull(message = "La provincia no puede estar vacía")
    private Long idProvincia;

    @NotNull(message = "El logo de la empresa no puede estar vacío")
    private String urlFotoPerfil; 

    private String urlDocumentoLegal;

}
