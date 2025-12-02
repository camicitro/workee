package com.example.demo.dtos.eventos;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EventoRequestDTO {

    @NotBlank(message = "El nombre del evento no puede estar vacío")
    @Size(min = 3, max = 80, message = "El nombre del evento debe tener entre 3 y 350 caracteres.")
    private String nombreEvento;

    @NotBlank(message = "La descripción del evento no puede estar vacía")
    @Size(min = 5, max = 350, message = "La descripción del evento debe tener entre 5 y 350 caracteres.")
    private String descripcionEvento;

    @NotNull(message = "El tipo de evento no puede estar vacío")
    private Long idTipoEvento;

    @NotBlank(message = "La fecha y hora de inicio del evento no puede estar vacío")
    private LocalDateTime fechaHoraInicioEvento; 

    @NotBlank(message = "La fecha y hora de fin del evento no puede estar vacío")
    private LocalDateTime fechaHoraFinEvento; 

    @NotNull(message = "La postulaciónEtapa asociada es obligatoria")
    private Long idPostulacionOfertaEtapa; 

    @NotNull(message = "El id del usuario candidato es obligatorio")
    private Long idUsuarioCandidato;

    @NotNull(message = "El id del usuario empleado es obligatorio")
    private Long idUsuarioEmpleado;

}
