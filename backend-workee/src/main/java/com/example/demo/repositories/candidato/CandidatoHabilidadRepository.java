package com.example.demo.repositories.candidato;

import com.example.demo.entities.candidato.CandidatoHabilidad;
import com.example.demo.entities.params.Habilidad;
import com.example.demo.repositories.BaseRepository;

public interface CandidatoHabilidadRepository extends BaseRepository<CandidatoHabilidad, Long> {
    Habilidad findByHabilidadId(Long idHabilidad);
    Boolean existsByHabilidadIdAndFechaHoraBajaIsNull(Long habilidadId);
    boolean existsByHabilidad_TipoHabilidad_IdAndFechaHoraBajaIsNull(Long idTipoHabilidad);
}
