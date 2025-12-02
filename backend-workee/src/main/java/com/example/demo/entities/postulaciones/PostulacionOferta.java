package com.example.demo.entities.postulaciones;

import java.util.Date;
import java.util.List;

import com.example.demo.entities.Base;
import com.example.demo.entities.candidato.Candidato;
import com.example.demo.entities.oferta.Oferta;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "postulacion_oferta")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostulacionOferta extends Base{
    
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "id_postulacion_oferta")
    private List<PostulacionOfertaEtapa> postulacionOfertaEtapaList;


    @ManyToOne()
    @JoinColumn(name = "id_candidato")
    @NotNull
    private Candidato candidato;

    @ManyToOne()
    @JoinColumn(name = "id_oferta")
    @NotNull
    private Oferta oferta;

    
    @Column(name = "fecha_hora_abandono_oferta")
    private Date fechaHoraAbandonoOferta;

    @Column(name = "id_iniciador_postulacion")
    private Long idIniciadorPostulacion;

    @Column(name = "fecha_hora_fin_postulacion_oferta")
    private Date fechaHoraFinPostulacionOferta;
}
