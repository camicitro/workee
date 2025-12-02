package com.example.demo.entities.eventos;

import java.time.LocalDateTime;

import com.example.demo.entities.Base;
import com.example.demo.entities.postulaciones.PostulacionOferta;
import com.example.demo.entities.seguridad.Usuario;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "notificacion")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notificacion extends Base{
    @NotNull
    @Column(name = "descripcion_notificacion")
    private String descripcionNotificacion;

    @NotNull
    @Column(name = "fecha_hora_envio_notificacion")
    private LocalDateTime fechaHoraEnvioNotificacion;

    @Column(name = "lectura_notificacion")
    private Boolean lecturaNotificacion;

    @NotNull
    @Column(name = "tipo_notificacion", length = 50)
    @Enumerated(EnumType.STRING)
    private TipoNotificacion tipoNotificacion;

    @NotNull
    @Column(name = "titulo_notificacion")
    private String tituloNotificacion;

    @ManyToOne()
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @ManyToOne()
    @JoinColumn(name = "id_evento")
    private Evento evento;

    @NotNull
    @Column(name = "enviada")
    private Boolean enviada = false;

    /*PARA LO QUE NECESITA EL MAXI */
    @ManyToOne()
    @JoinColumn(name = "id_postulacion")
    private PostulacionOferta postulacionOferta;
}
