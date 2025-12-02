package com.example.demo.repositories.videollamadas;

import org.springframework.stereotype.Repository;

import com.example.demo.entities.videollamadas.Videollamada;
import com.example.demo.repositories.BaseRepository;
import java.util.Optional;


@Repository
public interface VideollamadaRepository extends BaseRepository<Videollamada, Long>{
    Optional<Videollamada> findByEnlaceVideollamadaAndFechaHoraFinRealVideollamadaIsNull(String enlaceVideollamada);
}
