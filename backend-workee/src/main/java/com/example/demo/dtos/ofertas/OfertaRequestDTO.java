package com.example.demo.dtos.ofertas;

import java.util.List;


import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data //Para que lombok genere getters, setters y otros métodos
@AllArgsConstructor //Constructor con todos los campos
@NoArgsConstructor //Constructor vacío
public class OfertaRequestDTO {
    
    //Con NotBlank se indica que la cadena no puede ser nula ni tener espacios en blanco
    //message indica la cadena que se mostrará al no cumplir con la validación
    @NotBlank(message = "El título de la oferta no puede estar vacío")
    //Con size se indica la cantidad mínima (min) y máxima (max) de caracteres
    @Size(min = 2, max = 100, message = "El nombre de la oferta debe tener entre 2 y 100 caracteres.")
    private String titulo;
    
    @NotBlank(message = "La descripción de la oferta no puede estar vacía")
    @Size(min = 5, max = 350, message = "La descripción de la oferta debe tener entre 5 y 350 caracteres.")
    private String descripcion;   

    @NotBlank(message = "Las responsabilidades de la oferta no pueden estar vacías")
    @Size(min = 5, max = 350, message = "Las responsabilidades de la oferta debe tener entre 5 y 350 caracteres.")
    private String responsabilidades;

    //Con NotNull se indica que este campo no puede ser nulo (es obligatorio)
    @NotNull(message = "El id de la empresa no puede estar vacío")
    private Long idEmpresa;

    @NotNull(message = "El id de la modalidad de oferta no puede estar vacío")
    private Long idModalidadOferta;

    @NotNull(message = "El id del tipo de contrato de oferta no puede estar vacío")
    private Long idTipoContratoOferta;

    //Lista de IDs de habilidades requeridas para el puesto
    private List<Long> idHabilidades;

    //Lista de etapas del proceso, debe contener al menos una etapa (NotEmpty)
    //Se realizan las validaciones del DTO OfertaEtapaRequestDTO
    @NotEmpty(message = "La lista de etapas de la oferta no puede estar vacía")
    private List<@Valid OfertaEtapaRequestDTO> ofertaEtapas;

    /*
    Nota: Los siguientes valores no se cargan en el DTO, sino que se setean al crear la oferta: 
    - Estado (y EstadoOfertaEstado) como "Abierto",
    - fechaFinalizacion como null,
    - finalizadaConExito como null 
    */
}
