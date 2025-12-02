package com.example.demo.services.params;

import java.util.List;

import com.example.demo.dtos.params.TipoEventoRequestDTO;
import com.example.demo.entities.params.TipoEvento;
import com.example.demo.services.BaseService;

public interface TipoEventoService extends BaseService<TipoEvento, Long> {
    public TipoEvento guardarTipoEvento(TipoEventoRequestDTO tipoEventoRequestDTO);

    public TipoEvento actualizarTipoEvento(Long id, TipoEventoRequestDTO tipoEventoRequestDTO);

    public TipoEvento buscarTipoEventoPorId(Long id);

    public List<TipoEvento> obtenerTiposEventos();

    public List<TipoEvento> obtenerTiposEventosActivos();

    public Boolean habilitarTipoEvento(Long id);

    public Boolean deshabilitarTipoEvento(Long id);
}
