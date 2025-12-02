package com.example.demo.entities.postulaciones;

import com.example.demo.entities.Base;
import com.example.demo.entities.params.Etapa;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name = "postulacion_oferta_etapa")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostulacionOfertaEtapa extends Base{
    @ManyToOne()
    @JoinColumn(name = "id_etapa")
    private Etapa etapa;

    @Column(name = "respuesta_candidato")
    private String respuestaCandidato;

    @Column(name = "retroalimentacion_empresa", columnDefinition = "TEXT")
    private String retroalimentacionEmpresa;
}
