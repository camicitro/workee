package com.example.demo.services.candidato;

import com.example.demo.entities.candidato.Candidato;
import com.example.demo.entities.candidato.CandidatoCV;
import com.example.demo.services.BaseService;

public interface CandidatoCVService extends BaseService<CandidatoCV, Long> {
    CandidatoCV actualizarOCrearCV(Candidato candidato, String enlaceCV);
} 

