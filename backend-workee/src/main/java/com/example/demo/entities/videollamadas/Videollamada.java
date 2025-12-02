package com.example.demo.entities.videollamadas;

import java.time.LocalDateTime;
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
@Table(name = "videollamada")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Videollamada extends Base{
    
    @Column(name = "duracion_videollamada")
    private Double duracionVideollamada;

    @NotNull
    @Column(name = "enlace_videollamada")
    private String enlaceVideollamada; 

    @Column(name = "fecha_hora_fin_planif_videollamada")
    private LocalDateTime fechaHoraFinPlanifVideollamada ;

    @Column(name = "fecha_hora_fin_real_videollamada")
    private LocalDateTime fechaHoraFinRealVideollamada;

    @NotNull
    @Column(name = "fecha_hora_inicio_planif_videollamada")
    private LocalDateTime fechaHoraInicioPlanifVideollamada;

    @Column(name = "fecha_hora_inicio_real_videollamada")
    private LocalDateTime fechaHoraInicioRealVideollamada;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "id_videollamada")
    private List<DetalleVideollamada> detalleVideollamadaList;
}

