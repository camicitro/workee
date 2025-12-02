package com.example.demo.entities.oferta;

import com.example.demo.entities.Base;
import com.example.demo.entities.params.EstadoOferta;

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
@Table(name = "oferta_estado_oferta")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OfertaEstadoOferta extends Base {
    
    @ManyToOne
    @JoinColumn(name = "id_estado_oferta", nullable = false)
    private EstadoOferta estadoOferta;
}
