package com.example.demo.services.params;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.dtos.params.ModalidadOfertaRequestDTO;
import com.example.demo.entities.params.ModalidadOferta;
import com.example.demo.exceptions.EntityAlreadyEnabledException;
import com.example.demo.exceptions.EntityAlreadyExistsException;
import com.example.demo.exceptions.EntityNotValidException;
import com.example.demo.exceptions.EntityReferencedException;
import com.example.demo.repositories.oferta.OfertaRepository;
import com.example.demo.repositories.params.ModalidadOfertaRepository;
import com.example.demo.services.BaseServiceImpl;

import jakarta.transaction.Transactional;

@Service
public class ModalidadOfertaServiceImpl extends BaseServiceImpl<ModalidadOferta, Long> implements ModalidadOfertaService {

    private final ModalidadOfertaRepository modalidadOfertaRepository;
    private final OfertaRepository ofertaRepository;

    public ModalidadOfertaServiceImpl(ModalidadOfertaRepository modalidadOfertaRepository, OfertaRepository ofertaRepository) {
        super(modalidadOfertaRepository);
        this.modalidadOfertaRepository = modalidadOfertaRepository;
        this.ofertaRepository = ofertaRepository;
    } 
    
    @Override
    @Transactional
    public ModalidadOferta guardarModalidadOferta(ModalidadOfertaRequestDTO modalidadOfertaDTO) {
        if (yaExisteModalidadOferta(modalidadOfertaDTO.getNombreModalidadOferta(), null)) {
            throw new EntityAlreadyExistsException("Ya existe una modalidad de oferta con ese nombre");
        }

        ModalidadOferta nuevaModalidadOferta = new ModalidadOferta();
        nuevaModalidadOferta.setNombreModalidadOferta(modalidadOfertaDTO.getNombreModalidadOferta());
        nuevaModalidadOferta.setFechaHoraAlta(new Date());

        return modalidadOfertaRepository.save(nuevaModalidadOferta);
    }

    @Override
    @Transactional
    public ModalidadOferta actualizarModalidadOferta(Long id, ModalidadOfertaRequestDTO modalidadOfertaDTO) {
        ModalidadOferta modalidadOfertaOriginal = this.findById(id);
        
        if (yaExisteModalidadOferta(modalidadOfertaDTO.getNombreModalidadOferta(), id)) {
            throw new EntityAlreadyExistsException("Ya existe una modalidad de oferta con ese nombre");
        }

        modalidadOfertaOriginal.setNombreModalidadOferta(modalidadOfertaDTO.getNombreModalidadOferta());
        return modalidadOfertaRepository.save(modalidadOfertaOriginal);
    }

    @Override
    @Transactional
    public Boolean habilitarModalidadOferta(Long id) {
        if (id == null) {
            throw new EntityNotValidException("El ID de la modalidad de oferta no puede ser nulo");
        }

        ModalidadOferta modalidadOferta = this.findById(id);
        if (modalidadOferta.getFechaHoraBaja() == null) {
            throw new EntityAlreadyEnabledException("La modalidad de oferta ya está habilitada");
        }
        
        modalidadOferta.setFechaHoraBaja(null);
        modalidadOfertaRepository.save(modalidadOferta);
        return true;
    }

    @Override
    public List<ModalidadOferta> obtenerModalidadesOfertas() {
        return modalidadOfertaRepository.findAllByOrderByNombreModalidadOfertaAsc();
    }

    @Override
    public List<ModalidadOferta> obtenerModalidadesOfertasActivos() {
        return modalidadOfertaRepository.buscarModalidadOfertasActivos();
    }   

    private boolean yaExisteModalidadOferta(String nombreModalidadOferta, Long idAExcluir) {
        Optional<ModalidadOferta> modalidadOfertaExistente = modalidadOfertaRepository.findByNombreModalidadOfertaIgnoreCase(nombreModalidadOferta);
        return modalidadOfertaExistente
        .filter(e -> idAExcluir == null || !e.getId().equals(idAExcluir))
        .isPresent();    }

    
    @Override
    @Transactional
    public Boolean deshabilitarModalidadOferta(Long modalidadOfertaId){
        if(modalidadOfertaId == null) {
            throw new IllegalArgumentException("El ID no puede ser nulo");
        }

        boolean enUso = ofertaRepository.existsByModalidadOfertaIdAndFechaHoraBajaIsNull(modalidadOfertaId);
        if(enUso){
            throw new EntityReferencedException("La entidad se encuentra en uso, no puede deshabilitarla");

        } else {
            return delete(modalidadOfertaId);
        }
    }
}
