package com.example.demo.services.oferta;
import com.example.demo.entities.oferta.CodigoEstadoOferta;


import java.util.Date;

import org.springframework.stereotype.Service;

import com.example.demo.entities.oferta.OfertaEstadoOferta;
import com.example.demo.entities.params.EstadoOferta;
import com.example.demo.repositories.oferta.OfertaEstadoOfertaRepository;
import com.example.demo.services.BaseServiceImpl;
import com.example.demo.services.params.EstadoOfertaService;

@Service
public class OfertaEstadoOfertaServiceImpl extends BaseServiceImpl<OfertaEstadoOferta, Long> implements OfertaEstadoOfertaService {

    private final OfertaEstadoOfertaRepository ofertaEstadoOfertaRepository;
    private final EstadoOfertaService estadoOfertaService;

    public OfertaEstadoOfertaServiceImpl(OfertaEstadoOfertaRepository ofertaEstadoOfertaRepository, EstadoOfertaService estadoOfertaService) {
        super(ofertaEstadoOfertaRepository);
        this.ofertaEstadoOfertaRepository = ofertaEstadoOfertaRepository;
        this.estadoOfertaService = estadoOfertaService;
        
    }

    private OfertaEstadoOferta crearEstadoOferta(String codigoEstado) {
        EstadoOferta estado = estadoOfertaService.findByCodigo(codigoEstado); 

        OfertaEstadoOferta nuevoEstado = new OfertaEstadoOferta();
        nuevoEstado.setFechaHoraAlta(new Date());
        nuevoEstado.setFechaHoraBaja(null); // Inicialmente no hay baja
        nuevoEstado.setEstadoOferta(estado);

        return nuevoEstado; 
    }
    
    @Override
    public OfertaEstadoOferta abrirOferta() {
        return crearEstadoOferta(CodigoEstadoOferta.ABIERTA);
    }

    @Override
    public OfertaEstadoOferta cerrarOferta() {
        return crearEstadoOferta(CodigoEstadoOferta.CERRADA);
    }

    @Override
    public OfertaEstadoOferta finalizarOferta() {
        return crearEstadoOferta(CodigoEstadoOferta.FINALIZADA);
    }
}
