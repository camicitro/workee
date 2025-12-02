package com.example.demo.entities.candidato;

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
@Table(name = "candidato_habilidad")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CandidatoHabilidad extends Base {
    @ManyToOne
    @JoinColumn(name = "id_habilidad")
    @NotNull
    private Habilidad habilidad;
}
