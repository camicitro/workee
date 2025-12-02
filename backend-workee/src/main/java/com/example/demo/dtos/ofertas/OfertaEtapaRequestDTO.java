package com.example.demo.dtos.ofertas;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data //Para que lombok genere getters, setters y otros métodos
@AllArgsConstructor //Constructor con todos los campos
@NoArgsConstructor //Constructor vacío
public class OfertaEtapaRequestDTO {

    //Con NotNull se indica que este campo no puede ser nulo (es obligatorio)
    @NotNull(message = "El numero de la etapa no puede estar vacío")
    private Integer numeroEtapa;

    @NotNull(message = "El campo adjunta enlace no puede estar vacío")
    private Boolean adjuntaEnlace; //Indica si el candidato podrá o no hacer entregas

    @NotNull(message = "El id de la etapa no puede estar vacío")
    private Long idEtapa; //Es el id de la etapa seleccionada

    @NotNull(message = "El id del empleado de la empresa no puede estar vacío")
    private Long idEmpleadoEmpresa; //Es el ID del empleado asignado a la etapa

    @Size(max = 2048, message = "El enlace no puede tener más de 2048 caracteres")
    private String archivoAdjunto; // Puede ser null si no hay archivo adjunto

    @Size(max = 350, message = "La descripción de la etapa debe tener máximo 350 caracteres.")
    private String descripcionAdicional; //Puede no tener descripción adicional
    
}
