package com.example.demo.services.params;

import java.text.Normalizer;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.dtos.params.TipoEventoRequestDTO;
import com.example.demo.entities.params.TipoEvento;
import com.example.demo.exceptions.EntityAlreadyDisabledException;
import com.example.demo.exceptions.EntityAlreadyEnabledException;
import com.example.demo.exceptions.EntityAlreadyExistsException;
import com.example.demo.exceptions.EntityNotFoundException;
import com.example.demo.repositories.params.TipoEventoRepository;
import com.example.demo.services.BaseServiceImpl;

import jakarta.transaction.Transactional;

@Service
public class TipoEventoServiceImpl extends BaseServiceImpl<TipoEvento,Long> implements TipoEventoService {
    private final TipoEventoRepository tipoEventoRepository;

    public TipoEventoServiceImpl(TipoEventoRepository tipoEventoRepository) {
        super(tipoEventoRepository);
        this.tipoEventoRepository = tipoEventoRepository;
    }

    @Override
    @Transactional
    public TipoEvento guardarTipoEvento(TipoEventoRequestDTO tipoEventoRequestDTO) {
        if(yaExisteTipoEvento(tipoEventoRequestDTO.getNombreTipoEvento(), null)) {
            throw new EntityAlreadyExistsException("Ya existe un tipo de evento con ese nombre");
        }
        TipoEvento nuevTipoEvento = new TipoEvento();
        nuevTipoEvento.setNombreTipoEvento(tipoEventoRequestDTO.getNombreTipoEvento());
        nuevTipoEvento.setFechaHoraAlta(new Date());

        //Generar código para identificarla
        String codigoTipoEvento = generarCodigoUnico(tipoEventoRequestDTO.getNombreTipoEvento());
        nuevTipoEvento.setCodigoTipoEvento(codigoTipoEvento);

        return tipoEventoRepository.save(nuevTipoEvento);
    }

    private String generarCodigoUnico(String nombreTipoEvento){
        String base = normalizar(nombreTipoEvento);
        String codigoTipoEvento = base;
        int contador = 1;

        while(tipoEventoRepository.existsByCodigoTipoEvento(codigoTipoEvento)){
            codigoTipoEvento = base + "_" + contador;
            contador++;
        }
        return codigoTipoEvento;
    }

    private String normalizar(String texto){
        String sinAcentos = Normalizer.normalize(texto, Normalizer.Form.NFD)
            .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "");
        return sinAcentos.trim().toUpperCase().replaceAll("[^A-Z0-9]", "_");
    }

    @Override
    @Transactional
    public TipoEvento actualizarTipoEvento(Long id, TipoEventoRequestDTO tipoEventoRequestDTO) {
        TipoEvento tipoEventoOriginal = buscarTipoEventoPorId(id);
        
        if(yaExisteTipoEvento(tipoEventoRequestDTO.getNombreTipoEvento(),tipoEventoOriginal.getId())) {
            throw new EntityAlreadyExistsException("Ya existe un tipo de evento con ese nombre");
        }
        tipoEventoOriginal.setNombreTipoEvento(tipoEventoRequestDTO.getNombreTipoEvento());
        return tipoEventoRepository.save(tipoEventoOriginal);
    }

    @Override
    public TipoEvento buscarTipoEventoPorId(Long id) {
        return tipoEventoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tipo de evento no encontrado con ID: " + id));
    }

    @Override
    public List<TipoEvento> obtenerTiposEventos() {
        return tipoEventoRepository.findAllByOrderByNombreTipoEventoAsc();
    }

    @Override
    public List<TipoEvento> obtenerTiposEventosActivos() {
        return tipoEventoRepository.buscarTiposEventosActivos();
    }

    @Override
    @Transactional
    public Boolean habilitarTipoEvento(Long id) {
        if(id == null) {
            throw new IllegalArgumentException("El ID no puede ser nulo");
        }
        TipoEvento tipoEventoOriginal = buscarTipoEventoPorId(id);
        if(tipoEventoOriginal.getFechaHoraBaja() == null) {
            throw new EntityAlreadyEnabledException("El tipo de evento ya está habilitado");
        }
        tipoEventoOriginal.setFechaHoraBaja(null);
        tipoEventoRepository.save(tipoEventoOriginal);
        return true;
    }

    @Override
    @Transactional
    public Boolean deshabilitarTipoEvento(Long id) {
        if(id == null) {
            throw new IllegalArgumentException("El ID no puede ser nulo");
        }
        TipoEvento tipoEventoOriginal = buscarTipoEventoPorId(id);
        if(tipoEventoOriginal.getFechaHoraBaja() != null) {
            throw new EntityAlreadyDisabledException("El tipo de evento ya está deshabilitado");
        }
        tipoEventoOriginal.setFechaHoraBaja(new Date());
        tipoEventoRepository.save(tipoEventoOriginal);
        return true;
    }

    private Boolean yaExisteTipoEvento(String nombreTipoEvento, Long idTipoEventoOriginal) {
        Optional<TipoEvento> tipoEventoExistente = tipoEventoRepository.findByNombreTipoEventoIgnoreCase(nombreTipoEvento);
        if(idTipoEventoOriginal != null && tipoEventoExistente.isPresent()){
            if(idTipoEventoOriginal == tipoEventoExistente.get().getId()){
                return false;
            }
        }
        return tipoEventoExistente.isPresent();
    }
}
