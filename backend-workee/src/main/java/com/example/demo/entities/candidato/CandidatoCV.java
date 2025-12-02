package com.example.demo.entities.candidato;

import com.example.demo.entities.Base;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "candidato_cv")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CandidatoCV extends Base{
    private String enlaceCV;
}
