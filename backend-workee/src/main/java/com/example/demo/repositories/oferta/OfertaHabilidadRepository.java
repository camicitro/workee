package com.example.demo.repositories.oferta;

import com.example.demo.entities.oferta.OfertaHabilidad;
import com.example.demo.repositories.BaseRepository;

public interface OfertaHabilidadRepository extends BaseRepository<OfertaHabilidad, Long> {
    Boolean existsByHabilidadIdAndFechaHoraBajaIsNull(Long habilidadId);
    boolean existsByHabilidad_TipoHabilidad_IdAndFechaHoraBajaIsNull(Long idTipoHabilidad);
}
