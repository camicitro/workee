package com.example.demo.services.oferta;

import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.dtos.ofertas.OfertaEtapaRequestDTO;
import com.example.demo.entities.empresa.EmpleadoEmpresa;
import com.example.demo.entities.oferta.ArchivoAdjunto;
import com.example.demo.entities.oferta.OfertaEtapa;
import com.example.demo.entities.params.Etapa;
import com.example.demo.repositories.oferta.OfertaEtapaRepository;
import com.example.demo.services.BaseServiceImpl;
import com.example.demo.services.empresa.EmpleadoEmpresaService;
import com.example.demo.services.params.EtapaService;

import jakarta.transaction.Transactional;

@Service
public class OfertaEtapaServiceImpl extends BaseServiceImpl<OfertaEtapa, Long> implements OfertaEtapaService {
    
    private final OfertaEtapaRepository ofertaEtapaRepository;
    private final EmpleadoEmpresaService empleadoEmpresaService;
    private final EtapaService etapaService;

    public OfertaEtapaServiceImpl(OfertaEtapaRepository ofertaEtapaRepository, EmpleadoEmpresaService empleadoEmpresaService, EtapaService etapaService) {
        super(ofertaEtapaRepository);
        this.ofertaEtapaRepository = ofertaEtapaRepository;
        this.empleadoEmpresaService = empleadoEmpresaService;
        this.etapaService = etapaService;
    }

    @Override
    @Transactional
    public List<OfertaEtapa> crearOfertaEtapasDesdeDto(Long empresaId, List<OfertaEtapaRequestDTO> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            throw new IllegalArgumentException("La lista de DTOs no puede ser nula o vacía");
        }
        
        // cargar en lote etapas y empleados
        List<Long> idsEtapas = dtos.stream().map(OfertaEtapaRequestDTO::getIdEtapa).toList();
        List<Long> idsEmpleados = dtos.stream().map(OfertaEtapaRequestDTO::getIdEmpleadoEmpresa).toList();

        Map<Long, Etapa> etapaPorId = etapaService.findAllByIdIn(idsEtapas)
                .stream()
                .collect(Collectors.toMap(Etapa::getId, Function.identity()));
        
        Map<Long, EmpleadoEmpresa> empleadoPorId = empleadoEmpresaService.findAllById(idsEmpleados).stream()
            .collect(Collectors.toMap(EmpleadoEmpresa::getId, Function.identity()));

        // Construir las entidades OfertaEtapa
        List<OfertaEtapa> ofertaEtapas = dtos.stream()
        .sorted(Comparator.comparing(OfertaEtapaRequestDTO::getNumeroEtapa))
        .map(dto -> {
            Etapa etapa = etapaPorId.get(dto.getIdEtapa());
            EmpleadoEmpresa empleado = empleadoPorId.get(dto.getIdEmpleadoEmpresa());

            if (etapa == null || empleado == null) {
                throw new IllegalArgumentException("Etapa o Empleado no encontrado para el ID proporcionado");
            }

            OfertaEtapa ofertaEtapa = new OfertaEtapa();
            ofertaEtapa.setNumeroEtapa(dto.getNumeroEtapa());
            ofertaEtapa.setEtapa(etapa);
            ofertaEtapa.setEmpleadoEmpresa(empleado);
            ofertaEtapa.setFechaHoraAlta(new Date());
            ofertaEtapa.setAdjuntaEnlace(Boolean.TRUE.equals(dto.getAdjuntaEnlace()));
            ofertaEtapa.setDescripcionAdicional(dto.getDescripcionAdicional());

            if (dto.getArchivoAdjunto() != null&& !dto.getArchivoAdjunto().isBlank()) {
                ArchivoAdjunto archivoAdjunto = new ArchivoAdjunto();
                archivoAdjunto.setEnlaceArchivo(dto.getArchivoAdjunto().trim());
                archivoAdjunto.setFechaHoraAlta(new Date());
                ofertaEtapa.setArchivoAdjunto(archivoAdjunto);
            }
            return ofertaEtapa;
        }).toList();

        return ofertaEtapas;
    }

    @Override
    @Transactional
    public OfertaEtapa crearEtapaPredeterminada(String nombre, int numeroEtapa) {
        Etapa etapa = etapaService.findOrCreatePredeterminada(nombre);

        OfertaEtapa oe = new OfertaEtapa();
        oe.setNumeroEtapa(numeroEtapa);
        oe.setEtapa(etapa);
        oe.setFechaHoraAlta(new Date());
        oe.setAdjuntaEnlace(false);
        oe.setEmpleadoEmpresa(null); 
        return oe;
    }
}
