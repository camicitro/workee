package com.example.demo.services.candidato;

import java.util.Date;

import org.springframework.stereotype.Service;

import com.example.demo.entities.candidato.Candidato;
import com.example.demo.entities.candidato.CandidatoCV;
import com.example.demo.repositories.candidato.CandidatoCVRepository;
import com.example.demo.services.BaseServiceImpl;

import jakarta.transaction.Transactional;

@Service
public class CandidatoCVServiceImpl extends BaseServiceImpl<CandidatoCV, Long> implements CandidatoCVService {

    private final CandidatoCVRepository candidatoCVRepository;

    public CandidatoCVServiceImpl(CandidatoCVRepository candidatoCVRepository) {
        super(candidatoCVRepository);
        this.candidatoCVRepository = candidatoCVRepository;
    }

    @Override
    @Transactional
    public CandidatoCV actualizarOCrearCV(Candidato candidato, String enlaceCV) {        
        CandidatoCV cv = candidato.getCandidatoCV();
        
        if (enlaceCV == null || enlaceCV.isBlank()) {
            if(cv != null) {
                cv.setFechaHoraBaja(new Date());
                return candidatoCVRepository.save(cv);
            }
            return null; // No CV to update or create
        }

        if (cv == null) {
            cv = new CandidatoCV();
            candidato.setCandidatoCV(cv);
        }

        cv.setEnlaceCV(enlaceCV);
        cv.setFechaHoraAlta(new Date());
        cv.setFechaHoraBaja(null); // En caso de que se haya dado de baja antes.
        return candidatoCVRepository.save(cv);
    }
}
