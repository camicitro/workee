package com.example.demo.services.params;

import java.util.Date;
import java.util.List;
import java.util.Optional;


import org.springframework.stereotype.Service;

import com.example.demo.dtos.params.EstadoOfertaRequestDTO;
import com.example.demo.entities.params.EstadoOferta;
import com.example.demo.exceptions.EntityAlreadyEnabledException;
import com.example.demo.exceptions.EntityAlreadyExistsException;
import com.example.demo.exceptions.EntityNotFoundException;
import com.example.demo.exceptions.EntityNotValidException;
import com.example.demo.exceptions.EntityReferencedException;
import com.example.demo.repositories.oferta.OfertaEstadoOfertaRepository;
import com.example.demo.repositories.params.EstadoOfertaRepository;
import com.example.demo.services.BaseServiceImpl;

import jakarta.transaction.Transactional;

@Service
public class EstadoOfertaServiceImpl extends BaseServiceImpl<EstadoOferta, Long> implements EstadoOfertaService {

    private final EstadoOfertaRepository estadoOfertaRepository;
    private final OfertaEstadoOfertaRepository ofertaEstadoOfertaRepository;

    public EstadoOfertaServiceImpl(EstadoOfertaRepository estadoOfertaRepository, OfertaEstadoOfertaRepository ofertaEstadoOfertaRepository) {
        super(estadoOfertaRepository);
        this.estadoOfertaRepository = estadoOfertaRepository;
        this.ofertaEstadoOfertaRepository = ofertaEstadoOfertaRepository;
    }

    @Override
    @Transactional
    public EstadoOferta guardarEstadoOferta(EstadoOfertaRequestDTO estadoOfertaDTO) {
        if (yaExisteEstadoOferta(estadoOfertaDTO.getNombreEstadoOferta(), null)) {
            throw new EntityAlreadyExistsException("Ya existe un estado de oferta con ese nombre");
        }

        EstadoOferta nuevoEstadoOferta = new EstadoOferta();
        nuevoEstadoOferta.setNombreEstadoOferta(estadoOfertaDTO.getNombreEstadoOferta());
        nuevoEstadoOferta.setFechaHoraAlta(new Date());

        return estadoOfertaRepository.save(nuevoEstadoOferta);
    }

    @Override
    @Transactional
    public EstadoOferta actualizarEstadoOferta(Long id, EstadoOfertaRequestDTO estadoOfertaDTO) {
        EstadoOferta estadoOfertaOriginal = this.findById(id);

        if (yaExisteEstadoOferta(estadoOfertaDTO.getNombreEstadoOferta(), id)) {
            throw new EntityAlreadyExistsException("Ya existe un estado de oferta con ese nombre");
        }

        estadoOfertaOriginal.setNombreEstadoOferta(estadoOfertaDTO.getNombreEstadoOferta());
        return estadoOfertaRepository.save(estadoOfertaOriginal);
    }

    @Override
    @Transactional
    public Boolean habilitarEstadoOferta(Long id) {
        if (id == null) {
            throw new EntityNotValidException("El ID del estado de oferta no puede ser nulo");
        }

        EstadoOferta estadoOferta = this.findById(id);
        
        if (estadoOferta.getFechaHoraBaja() == null) {
            throw new EntityAlreadyEnabledException("El estado de oferta ya está habilitado");
        }
        
        estadoOferta.setFechaHoraBaja(null);
        estadoOfertaRepository.save(estadoOferta);    
        return true;
    }


    @Override
    public List<EstadoOferta> obtenerEstadoOfertas() {
        return estadoOfertaRepository.findAllByOrderByNombreEstadoOfertaAsc();
    }

    @Override
    public List<EstadoOferta> obtenerEstadoOfertasActivos() {
        return estadoOfertaRepository.buscarEstadoOfertasActivos();
    }

    private Boolean yaExisteEstadoOferta(String nombreEstadoOferta, Long idAExcluir) {
        Optional<EstadoOferta> estadoOfertaExistente = estadoOfertaRepository.findByNombreEstadoOfertaIgnoreCase(nombreEstadoOferta);
        return estadoOfertaExistente
        .filter(e -> idAExcluir == null || !e.getId().equals(idAExcluir))
        .isPresent();    
    }

    @Override
    @Transactional
    public EstadoOferta findByCodigo(String codigo) {
        Optional<EstadoOferta> estadoOfertaOpt = estadoOfertaRepository.findByCodigo(codigo);
        if (estadoOfertaOpt.isEmpty()) {
            throw new EntityNotFoundException("No existe un estado de oferta con el código: " + codigo);
        }
        return estadoOfertaOpt.get();
    }

    @Override
    @Transactional
    public Boolean deshabilitarEstadoOferta(Long estadoOfertaId){
        if(estadoOfertaId == null) {
            throw new IllegalArgumentException("El ID no puede ser nulo");
        }
        
        boolean enUso = ofertaEstadoOfertaRepository.existsByEstadoOfertaIdAndFechaHoraBajaIsNull(estadoOfertaId);
        if(enUso) {
            throw new EntityReferencedException("La entidad se encuentra en uso, no puede deshabilitarla");
        } else {
            return delete(estadoOfertaId);
        }
    }   
}
