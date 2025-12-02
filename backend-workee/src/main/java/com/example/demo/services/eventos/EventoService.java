package com.example.demo.services.eventos;

import java.time.LocalDateTime;
import java.util.List;

import com.example.demo.dtos.eventos.EventoRequestDTO;
import com.example.demo.entities.eventos.Evento;
import com.example.demo.services.BaseService;

public interface EventoService extends BaseService<Evento, Long>{

    Evento crearEvento(EventoRequestDTO evento);

    Evento modificarEvento(Long id, EventoRequestDTO eventoRequestDTO);

    void eliminarEvento(Long id);

    List<Evento> obtenerEventosPorUsuario(Long idUsuario);

    List<Evento> obtenerEventosPorEmpresa(Long idEmpresa);

    List<Evento> obtenerEventosEntreFechas(LocalDateTime desde, LocalDateTime hasta);

    List<Evento> obtenerEventosPorPostulacion(Long idPostulacion);

}
