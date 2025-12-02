package com.example.demo.services.params;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.dtos.params.TipoContratoOfertaRequestDTO;
import com.example.demo.entities.params.TipoContratoOferta;
import com.example.demo.exceptions.EntityAlreadyEnabledException;
import com.example.demo.exceptions.EntityAlreadyExistsException;
import com.example.demo.exceptions.EntityReferencedException;
import com.example.demo.repositories.oferta.OfertaRepository;
import com.example.demo.repositories.params.TipoContratoOfertaRepository;
import com.example.demo.services.BaseServiceImpl;

import jakarta.transaction.Transactional;

@Service
public class TipoContratoOfertaServiceImpl extends BaseServiceImpl<TipoContratoOferta,Long> implements TipoContratoOfertaService {

    private final TipoContratoOfertaRepository tipoContratoOfertaRepository;
    private final OfertaRepository ofertaRepository;


    public TipoContratoOfertaServiceImpl(TipoContratoOfertaRepository tipoContratoOfertaRepository, OfertaRepository ofertaRepository) {
        super(tipoContratoOfertaRepository);
        this.tipoContratoOfertaRepository = tipoContratoOfertaRepository;
        this.ofertaRepository = ofertaRepository;
    }

    @Override
    @Transactional
    public TipoContratoOferta guardarTipoContratoOferta(TipoContratoOfertaRequestDTO tipoContratoOfertaRequestDTO) {
        if(yaExisteTipoContratoOferta(tipoContratoOfertaRequestDTO.getNombreTipoContratoOferta(), null)) {
            throw new EntityAlreadyExistsException("El tipo de contrato de oferta ya existe.");
        }
        TipoContratoOferta tipoContratoOferta = new TipoContratoOferta();
        tipoContratoOferta.setNombreTipoContratoOferta(tipoContratoOfertaRequestDTO.getNombreTipoContratoOferta());
        tipoContratoOferta.setFechaHoraAlta(new Date());

        return tipoContratoOfertaRepository.save(tipoContratoOferta);
    }

    @Override
    @Transactional
    public TipoContratoOferta actualizarTipoContratoOferta(Long id, TipoContratoOfertaRequestDTO tipoContratoOfertaRequestDTO) {
        if(tipoContratoOfertaRequestDTO.getNombreTipoContratoOferta() == null || tipoContratoOfertaRequestDTO.getNombreTipoContratoOferta().isEmpty()) {
            throw new IllegalArgumentException("El nombre del tipo de contrato de oferta no puede estar vacío");
        }
        TipoContratoOferta tipoContratoOferta = findById(id);//buscarTipoContratoOfertaPorId(id);
        if(yaExisteTipoContratoOferta(tipoContratoOfertaRequestDTO.getNombreTipoContratoOferta(), tipoContratoOferta.getId())) {
            throw new EntityAlreadyExistsException("El tipo de contrato de oferta ya existe.");
        } else {
            tipoContratoOferta.setNombreTipoContratoOferta(tipoContratoOfertaRequestDTO.getNombreTipoContratoOferta());
            return tipoContratoOfertaRepository.save(tipoContratoOferta);
        }
    }

    @Override
    public List<TipoContratoOferta> obtenerTiposContratosOferta() {
        return tipoContratoOfertaRepository.findAllByOrderByNombreTipoContratoOfertaAsc();
    }

    @Override
    public List<TipoContratoOferta> obtenerTiposContratosOfertaActivos() {
        return tipoContratoOfertaRepository.buscarTiposContratosOfertaActivos();
    }

    @Override
    @Transactional
    public Boolean habilitarTipoContratoOferta(Long id) {
        if(id == null) {
            throw new IllegalArgumentException("El ID no puede ser nulo");
        }
        TipoContratoOferta tipoContratoOferta = findById(id);//buscarTipoContratoOfertaPorId(id);
        if(tipoContratoOferta.getFechaHoraBaja() == null) {
            throw new EntityAlreadyEnabledException("El tipo de contrato de oferta ya está habilitado");
        }
        tipoContratoOferta.setFechaHoraBaja(null);
        tipoContratoOfertaRepository.save(tipoContratoOferta);
        return true;
    }


    private Boolean yaExisteTipoContratoOferta(String nombreTipoContratoOferta, Long idTipoContratoOfertaOriginal) {
        Optional<TipoContratoOferta> tipoContratoOfertaExistente = tipoContratoOfertaRepository.findByNombreTipoContratoOfertaIgnoreCase(nombreTipoContratoOferta);
        if(idTipoContratoOfertaOriginal != null && tipoContratoOfertaExistente.isPresent()){
            if(idTipoContratoOfertaOriginal == tipoContratoOfertaExistente.get().getId()){
                return false;
            }
        }
        return tipoContratoOfertaExistente.isPresent();
    }

    @Override
    @Transactional
    public Boolean deshabilitarTipoContratoOferta(Long tipoContratoOfertaId){
        if (tipoContratoOfertaId == null){
            throw new IllegalArgumentException("El ID no puede ser nulo");
        }

        boolean enUso = ofertaRepository.existsByModalidadOfertaIdAndFechaHoraBajaIsNull(tipoContratoOfertaId);
        if(enUso){
            throw new EntityReferencedException("La entidad se encuentra en uso, no puede deshabilitarla");
        } else {
            return delete(tipoContratoOfertaId);
        }
    }

}
