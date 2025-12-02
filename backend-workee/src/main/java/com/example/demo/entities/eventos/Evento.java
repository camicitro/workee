package com.example.demo.entities.eventos;

import java.time.LocalDateTime;

import com.example.demo.entities.Base;
import com.example.demo.entities.params.TipoEvento;
import com.example.demo.entities.postulaciones.PostulacionOfertaEtapa;
import com.example.demo.entities.seguridad.Usuario;
import com.example.demo.entities.videollamadas.Videollamada;

import jakarta.persistence.CascadeType;
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
@Table(name = "evento")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Evento extends Base{
    @Column(name = "descripcion_evento")
    private String descripcionEvento;

    @NotNull
    @Column(name = "nombre_evento")
    private String nombreEvento;
    
    @NotNull
    @Column(name = "fecha_hora_inicio_evento")
    private LocalDateTime fechaHoraInicioEvento;
    
    @Column(name = "fecha_hora_fin_evento")
    private LocalDateTime fechaHoraFinEvento;

    @NotNull
    @ManyToOne()
    @JoinColumn(name = "id_usuario_candidato", nullable = false)
    private Usuario usuarioCandidato;

    @NotNull
    @ManyToOne()
    @JoinColumn(name = "id_usuario_empleado", nullable = false)
    private Usuario usuarioEmpleado;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true) 
    @JoinColumn(name = "id_videollamada", nullable = true)
    private Videollamada videollamada; 

    @ManyToOne()
    @JoinColumn(name = "id_tipo_evento", nullable = false)
    private TipoEvento tipoEvento;

    @NotNull
    @ManyToOne()
    @JoinColumn(name = "id_postulacion_oferta_etapa", nullable = false)
    private PostulacionOfertaEtapa postulacionOfertaEtapa;
}
    