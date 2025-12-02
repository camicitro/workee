package com.example.demo.services.params;

import java.text.Normalizer;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.dtos.params.TipoHabilidadRequestDTO;
import com.example.demo.entities.params.TipoHabilidad;
import com.example.demo.exceptions.EntityAlreadyEnabledException;
import com.example.demo.exceptions.EntityAlreadyExistsException;
import com.example.demo.exceptions.EntityNotValidException;
import com.example.demo.repositories.candidato.CandidatoHabilidadRepository;
import com.example.demo.repositories.candidato.CandidatoRepository;
import com.example.demo.repositories.oferta.OfertaHabilidadRepository;
import com.example.demo.repositories.params.TipoHabilidadRepository;
import com.example.demo.services.BaseServiceImpl;

import jakarta.transaction.Transactional;

@Service
public class TipoHabilidadServiceImpl extends BaseServiceImpl<TipoHabilidad, Long> implements TipoHabilidadService{
    
    private final TipoHabilidadRepository tipoHabilidadRepository;
    private final CandidatoRepository candidatoRepository;
    private final CandidatoHabilidadRepository candidatoHabilidadRepository;
    private final OfertaHabilidadRepository ofertaHabilidadRepository;
    
    public TipoHabilidadServiceImpl(TipoHabilidadRepository tipoHabilidadRepository, CandidatoRepository candidatoRepository, OfertaHabilidadRepository ofertaHabilidadRepository, CandidatoHabilidadRepository candidatoHabilidadRepository) {
        super(tipoHabilidadRepository);
        this.tipoHabilidadRepository = tipoHabilidadRepository;
        this.candidatoRepository = candidatoRepository;
        this.ofertaHabilidadRepository = ofertaHabilidadRepository;
        this.candidatoHabilidadRepository = candidatoHabilidadRepository;
    }

    @Override
    @Transactional
    public TipoHabilidad guardarTipoHabilidad(TipoHabilidadRequestDTO tipoHabilidadDTO) {
        if (yaExisteTipoHabilidad(tipoHabilidadDTO.getNombreTipoHabilidad(), null)) {
            throw new EntityAlreadyExistsException("Ya existe un tipo de habilidad con ese nombre");
        }

        TipoHabilidad nuevoTipoHabilidad = new TipoHabilidad();
        nuevoTipoHabilidad.setNombreTipoHabilidad(tipoHabilidadDTO.getNombreTipoHabilidad());
        nuevoTipoHabilidad.setFechaHoraAlta(new Date());

        //Generar código para identificarla
        String codigoTipoHabilidad = generarCodigoUnico(tipoHabilidadDTO.getNombreTipoHabilidad());
        nuevoTipoHabilidad.setCodigoTipoHabilidad(codigoTipoHabilidad);


        return tipoHabilidadRepository.save(nuevoTipoHabilidad);
    }

    private String generarCodigoUnico(String nombreTipoHabilidad){
        String base = normalizar(nombreTipoHabilidad);
        String codigoTipoHabilidad = base;
        int contador = 1;

        while(tipoHabilidadRepository.existsByCodigoTipoHabilidad(codigoTipoHabilidad)){
            codigoTipoHabilidad = base + "_" + contador;
            contador++;
        }
        return codigoTipoHabilidad;
    }

    private String normalizar(String texto){
        String sinAcentos = Normalizer.normalize(texto, Normalizer.Form.NFD)
            .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "");
        return sinAcentos.trim().toUpperCase().replaceAll("[^A-Z0-9]", "_");
    }


    @Override
    @Transactional
    public TipoHabilidad actualizarTipoHabilidad(Long id, TipoHabilidadRequestDTO tipoHabilidadDTO) {
        TipoHabilidad tipoHabilidadOriginal = this.findById(id);
        
        if (yaExisteTipoHabilidad(tipoHabilidadDTO.getNombreTipoHabilidad(), id)) {
            throw new EntityAlreadyExistsException("Ya existe un tipo de habilidad con ese nombre");
        }

        tipoHabilidadOriginal.setNombreTipoHabilidad(tipoHabilidadDTO.getNombreTipoHabilidad());
        return tipoHabilidadRepository.save(tipoHabilidadOriginal);
    }

    @Override
    @Transactional
    public Boolean habilitarTipoHabilidad(Long id) {
        if(id == null) {
            throw new EntityNotValidException("El ID del tipo de habilidad no puede ser nulo");
        }

        TipoHabilidad tipoHabilidad = this.findById(id);
        
        if (tipoHabilidad.getFechaHoraBaja() == null) {
            throw new EntityAlreadyEnabledException("El tipo de habilidad ya está habilitado");
        }

        tipoHabilidad.setFechaHoraBaja(null);
        tipoHabilidadRepository.save(tipoHabilidad);
        return true;
    }

    @Override
    public List<TipoHabilidad> obtenerTipoHabilidades() {
        return tipoHabilidadRepository.findAllByOrderByNombreTipoHabilidadAsc();
    }

    @Override
    public List<TipoHabilidad> obtenerTipoHabilidadesActivos() {
        return tipoHabilidadRepository.buscarTipoHabilidadesActivos();
    }


    private Boolean yaExisteTipoHabilidad(String nombreTipoHabilidad, Long idAExcluir) {
        Optional<TipoHabilidad> tipoHabilidadExiste = tipoHabilidadRepository.findByNombreTipoHabilidadIgnoreCase(nombreTipoHabilidad);
        return tipoHabilidadExiste
        .filter(e -> idAExcluir == null || !e.getId().equals(idAExcluir))
        .isPresent();
    }
 
    @Override
    @Transactional
    public Boolean deshabilitarTipoHabilidad(Long id) {
        if(id == null) {
            throw new EntityNotValidException("El ID del tipo de habilidad no puede ser nulo");
        }
        if(enUso(id)) {
            throw new EntityNotValidException("La entidad se encuentra en uso, no puede deshabilitarla");
        } else {
            return delete(id);
        }
    }

    private Boolean enUso(Long idTipoHabilidad) {
        boolean enUsoPorCandidatos = candidatoHabilidadRepository.existsByHabilidad_TipoHabilidad_IdAndFechaHoraBajaIsNull(idTipoHabilidad);
        boolean enUsoPorOfertas = ofertaHabilidadRepository.existsByHabilidad_TipoHabilidad_IdAndFechaHoraBajaIsNull(idTipoHabilidad);
        return enUsoPorCandidatos || enUsoPorOfertas;
    }   
}

