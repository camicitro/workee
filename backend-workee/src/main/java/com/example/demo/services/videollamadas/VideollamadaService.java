package com.example.demo.services.videollamadas;

import com.example.demo.dtos.eventos.EventoRequestDTO;
import com.example.demo.entities.videollamadas.Videollamada;
import com.example.demo.services.BaseService;

public interface VideollamadaService extends BaseService<Videollamada, Long>{
    public Videollamada crearVideollamada(EventoRequestDTO datosEvento);

    public Videollamada finalizarVideollamada(Long idVideollamada);

    public Videollamada iniciarVideollamada(Long videollamadaId);
}
