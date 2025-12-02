package com.example.demo.services.oferta;

import com.example.demo.entities.oferta.OfertaEstadoOferta;
import com.example.demo.services.BaseService;

public interface OfertaEstadoOfertaService extends BaseService<OfertaEstadoOferta, Long> {

    OfertaEstadoOferta abrirOferta();
    OfertaEstadoOferta cerrarOferta();
    OfertaEstadoOferta finalizarOferta();
}
