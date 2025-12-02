package com.example.demo.services.params;

import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.dtos.params.HabilidadRequestDTO;
import com.example.demo.entities.params.Habilidad;
import com.example.demo.entities.params.TipoHabilidad;
import com.example.demo.exceptions.EntityAlreadyEnabledException;
import com.example.demo.exceptions.EntityAlreadyExistsException;
import com.example.demo.exceptions.EntityNotFoundException;
import com.example.demo.exceptions.EntityNotValidException;
import com.example.demo.exceptions.EntityReferencedException;
import com.example.demo.repositories.candidato.CandidatoHabilidadRepository;
import com.example.demo.repositories.oferta.OfertaHabilidadRepository;
import com.example.demo.repositories.params.HabilidadRepository;
import com.example.demo.services.BaseServiceImpl;

import jakarta.transaction.Transactional;


@Service
public class HabilidadServiceImpl extends BaseServiceImpl<Habilidad, Long> implements HabilidadService {
    
    private final HabilidadRepository habilidadRepository;
    private final TipoHabilidadService tipoHabilidadService;
    private final CandidatoHabilidadRepository candidatoHabilidadRepository;
    private final OfertaHabilidadRepository ofertaHabilidadRepository;
    
    public HabilidadServiceImpl(HabilidadRepository habilidadRepository, TipoHabilidadService tipoHabilidadService, CandidatoHabilidadRepository candidatoHabilidadRepository, OfertaHabilidadRepository ofertaHabilidadRepository) {
        super(habilidadRepository);
        this.habilidadRepository = habilidadRepository;
        this.tipoHabilidadService = tipoHabilidadService;
        this.candidatoHabilidadRepository = candidatoHabilidadRepository;
        this.ofertaHabilidadRepository = ofertaHabilidadRepository;
    }

    @Override
    public List<Habilidad> findHabilidadByTipoHabilidad(Long idTipoHabilidad) {
        if (idTipoHabilidad == null) {
            throw new EntityNotValidException("El ID del tipo de habilidad no puede ser nulo");
        }

        tipoHabilidadService.findById(idTipoHabilidad);
        return habilidadRepository.findByTipoHabilidadId(idTipoHabilidad);
    }


    @Override
    @Transactional
    public Habilidad guardarHabilidad(HabilidadRequestDTO habilidadDTO){
        if(yaExisteHabilidad(habilidadDTO.getNombreHabilidad(), null)){
            throw new EntityAlreadyExistsException("Ya existe una habilidad con ese nombre");
        }

        Habilidad nuevaHabilidad = new Habilidad();
        nuevaHabilidad.setNombreHabilidad(habilidadDTO.getNombreHabilidad());
        nuevaHabilidad.setFechaHoraAlta(new Date());

        if(habilidadDTO.getIdTipoHabilidad() == null) {
            throw new EntityNotValidException(  "El ID del tipo de habilidad no puede ser nulo");
        }
        
        TipoHabilidad tipoHabilidadBuscada = tipoHabilidadService.findById(habilidadDTO.getIdTipoHabilidad());

        nuevaHabilidad.setTipoHabilidad(tipoHabilidadBuscada);

        return habilidadRepository.save(nuevaHabilidad);
    }

    @Override
    @Transactional
    public Habilidad actualizarHabilidad(Long id, HabilidadRequestDTO habilidadDTO){

        Habilidad habilidadOriginal = findById(id);

        if(habilidadDTO.getNombreHabilidad() != null && !habilidadDTO.getNombreHabilidad().isBlank() ){
            if(!habilidadOriginal.getNombreHabilidad().equalsIgnoreCase(habilidadDTO.getNombreHabilidad())) {
                if(yaExisteHabilidad(habilidadDTO.getNombreHabilidad(), id)) {
                    throw new EntityAlreadyExistsException("Ya existe una habilidad con ese nombre");
                }
                habilidadOriginal.setNombreHabilidad(habilidadDTO.getNombreHabilidad());
            }
        }            

        if(habilidadDTO.getIdTipoHabilidad() != null){
            if(!habilidadOriginal.getTipoHabilidad().getId().equals(habilidadDTO.getIdTipoHabilidad())) {
                TipoHabilidad tipoHabilidad = tipoHabilidadService.findById(habilidadDTO.getIdTipoHabilidad());
                habilidadOriginal.setTipoHabilidad((tipoHabilidad));
            }
        }

        return habilidadRepository.save(habilidadOriginal);
    }

    @Override
    @Transactional
    public Boolean habilitarHabilidad(Long id){
        if(id == null) {
            throw new EntityNotValidException("El ID de la habilidad no puede ser nulo");
        }
        Habilidad habilidadOriginal = findById(id);
        if(habilidadOriginal.getFechaHoraBaja() == null) {
            throw new EntityAlreadyEnabledException("La habilidad ya está habilitada");
        }
        habilidadOriginal.setFechaHoraBaja(null);
        habilidadRepository.save(habilidadOriginal);
        return true;
    }
    
    @Override
    public List<Habilidad> obtenerHabilidades() {
        return habilidadRepository.findAllByOrderByNombreHabilidadAsc();
    }

    @Override
    public List<Habilidad> obtenerHabilidadesActivas() {
        return habilidadRepository.buscarHabilidadesActivas();
    }

    private Boolean yaExisteHabilidad(String nombreHabilidad, Long idAExcluir) {
        Optional<Habilidad> habilidadExiste = habilidadRepository.findByNombreHabilidadIgnoreCase(nombreHabilidad);
        return habilidadExiste
        .filter(h -> idAExcluir == null || !h.getId().equals(idAExcluir))
        .isPresent();
    }

    @Override
    @Transactional
    public Boolean deshabilitarHabilidad(Long id) {
        if(id == null) {
            throw new EntityNotValidException("El ID de la habilidad no puede ser nulo");
        }
        if(enUso(id)) {
            throw new EntityReferencedException("La entidad se encuentra en uso, no puede deshabilitarla");
        } else {
            return delete(id);
        }

    }

    private Boolean enUso(Long habilidadId) {
        Boolean usadaEnOfertas = ofertaHabilidadRepository
                .existsByHabilidadIdAndFechaHoraBajaIsNull(habilidadId);

        Boolean usadaEnCandidatos = candidatoHabilidadRepository
                .existsByHabilidadIdAndFechaHoraBajaIsNull(habilidadId);

        return usadaEnOfertas || usadaEnCandidatos;
    }

    @Override
    public List<Habilidad> findAllById(Collection<Long> ids) {
        
        if (ids == null || ids.isEmpty()) {
            throw new IllegalArgumentException("La colección de IDs no puede ser nula o vacía");
        }
        
        List<Long> idsDistintos = ids.stream().distinct().toList();

        List<Habilidad> habilidades = habilidadRepository.findAllByIdIn(idsDistintos);
        
        // 3) (Opcional) Validar que existan todas
        Set<Long> encontrados = habilidades.stream()
                                            .map(Habilidad::getId)
                                            .collect(Collectors.toSet());
        List<Long> faltantes = idsDistintos.stream()
                                            .filter(id -> !encontrados.contains(id))
                                            .toList();
        
        if (!faltantes.isEmpty()) {
            throw new EntityNotFoundException("Habilidades inexistentes: " + faltantes);
        }

        // 4) Devuelve la lista con todas las entidades
        return habilidades;
    }
}