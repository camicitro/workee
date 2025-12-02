package com.example.demo.services.params;

import java.util.List;

import com.example.demo.dtos.params.TipoContratoOfertaRequestDTO;
import com.example.demo.entities.params.TipoContratoOferta;
import com.example.demo.services.BaseService;

public interface TipoContratoOfertaService extends BaseService<TipoContratoOferta, Long>{
    public TipoContratoOferta guardarTipoContratoOferta(TipoContratoOfertaRequestDTO tipoContratoOfertaRequestDTO);

    public TipoContratoOferta actualizarTipoContratoOferta(Long id, TipoContratoOfertaRequestDTO tipoContratoOfertaRequestDTO);

    public List<TipoContratoOferta> obtenerTiposContratosOferta();

    public List<TipoContratoOferta> obtenerTiposContratosOfertaActivos();

    public Boolean habilitarTipoContratoOferta(Long id);

    public Boolean deshabilitarTipoContratoOferta(Long id);

}
