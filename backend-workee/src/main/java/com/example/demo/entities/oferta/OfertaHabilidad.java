package com.example.demo.entities.oferta;

import com.example.demo.entities.Base;
import com.example.demo.entities.params.Habilidad;

import jakarta.persistence.Entity;
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
@Table(name = "oferta_habilidad")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OfertaHabilidad extends Base {

    @ManyToOne
    @JoinColumn(name = "id_habilidad", nullable = false)
    @NotNull
    private Habilidad habilidad; 
}
