package com.example.demo.services.params;
import java.text.Normalizer;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.dtos.params.EstadoBusquedaRequestDTO;
import com.example.demo.entities.params.EstadoBusqueda;
import com.example.demo.exceptions.EntityAlreadyEnabledException;
import com.example.demo.exceptions.EntityAlreadyExistsException;
import com.example.demo.exceptions.EntityNotValidException;
import com.example.demo.exceptions.EntityReferencedException;
import com.example.demo.repositories.candidato.CandidatoRepository;
import com.example.demo.repositories.params.EstadoBusquedaRepository;
import com.example.demo.services.BaseServiceImpl;

import jakarta.transaction.Transactional;

@Service
public class EstadoBusquedaServiceImpl extends BaseServiceImpl<EstadoBusqueda, Long> implements EstadoBusquedaService {
    
    private final EstadoBusquedaRepository estadoBusquedaRepository;
    private final CandidatoRepository candidatoRepository;
   
    public EstadoBusquedaServiceImpl(EstadoBusquedaRepository estadoBusquedaRepository, CandidatoRepository candidatoRepository) {
        super(estadoBusquedaRepository);
        this.estadoBusquedaRepository = estadoBusquedaRepository;
        this.candidatoRepository = candidatoRepository;
    }

    @Override
    @Transactional
    public EstadoBusqueda guardarEstadoBusqueda(EstadoBusquedaRequestDTO estadoBusquedaDTO) {

        if(yaExisteEstadoBusqueda(estadoBusquedaDTO.getNombreEstadoBusqueda(), null)) {
            throw new EntityAlreadyExistsException("Ya existe un estado de búsqueda con ese nombre");
        }
        
        EstadoBusqueda nuevoEstadoBusqueda = new EstadoBusqueda();
        nuevoEstadoBusqueda.setNombreEstadoBusqueda(estadoBusquedaDTO.getNombreEstadoBusqueda());
        nuevoEstadoBusqueda.setFechaHoraAlta(new Date());

        //Generar un codigo para identificarlo
        String codigoEstadoBusqueda = generarCodigoUnico(estadoBusquedaDTO.getNombreEstadoBusqueda());
        nuevoEstadoBusqueda.setCodigoEstadoBusqueda(codigoEstadoBusqueda);
        
        return estadoBusquedaRepository.save(nuevoEstadoBusqueda);
    }

    private String generarCodigoUnico(String nombreEstadoBusqueda){
        String base = normalizar(nombreEstadoBusqueda);
        String codigoEstado = base;
        int contador = 1;

        while(estadoBusquedaRepository.existsByCodigoEstadoBusqueda(codigoEstado)){
            codigoEstado = base + "_" + contador;
            contador++;
        }
        return codigoEstado;
    }

    private String normalizar(String texto){
        String sinAcentos = Normalizer.normalize(texto, Normalizer.Form.NFD)
            .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "");
        return sinAcentos.trim().toUpperCase().replaceAll("[^A-Z0-9]", "_");
    }

    @Override
    @Transactional  
    public EstadoBusqueda actualizarEstadoBusqueda(Long id, EstadoBusquedaRequestDTO estadoBusquedaDTO) {
        EstadoBusqueda estadoBusquedaOriginal = this.findById(id);
        
        if (yaExisteEstadoBusqueda(estadoBusquedaDTO.getNombreEstadoBusqueda(), id)) {
            throw new EntityAlreadyExistsException("Ya existe un estado de búsqueda con ese nombre");
        }
        
        estadoBusquedaOriginal.setNombreEstadoBusqueda(estadoBusquedaDTO.getNombreEstadoBusqueda());
        return estadoBusquedaRepository.save(estadoBusquedaOriginal);
    }

    @Override
    @Transactional
    public Boolean habilitarEstadoBusqueda(Long id) {
        if(id == null) {
            throw new EntityNotValidException("El ID del estado de búsqueda no puede ser nulo");
        }
        
        EstadoBusqueda estadoBusqueda = this.findById(id);
        
        if(estadoBusqueda.getFechaHoraBaja() == null) {
            throw new EntityAlreadyEnabledException("El estado de búsqueda ya está habilitado");
        }
        
        estadoBusqueda.setFechaHoraBaja(null);
        estadoBusquedaRepository.save(estadoBusqueda);
        return true;
    }

    @Override
    public List<EstadoBusqueda> obtenerEstadosBusqueda() {
        return estadoBusquedaRepository.findAllByOrderByNombreEstadoBusquedaAsc();
    }

    @Override
    public List<EstadoBusqueda> obtenerEstadosBusquedaActivos() {
        return estadoBusquedaRepository.buscarEstadosBusquedaActivos();
    }

    private Boolean yaExisteEstadoBusqueda(String nombreEstadoBusqueda, Long idAExcluir) {
        Optional<EstadoBusqueda> estadoBusquedaExiste = estadoBusquedaRepository.findByNombreEstadoBusquedaIgnoreCase(nombreEstadoBusqueda);
        return estadoBusquedaExiste
        .filter(e -> idAExcluir == null || !e.getId().equals(idAExcluir))
        .isPresent();
    }

    @Override
    @Transactional
    public Boolean deshabilitarEstadoBusqueda(Long idEstadoBusqueda) {
        if(idEstadoBusqueda == null) {
            throw new EntityNotValidException("El ID del estado de búsqueda no puede ser nulo");
        }

        boolean enUso = candidatoRepository.existsByEstadoBusquedaIdAndFechaHoraBajaIsNull(idEstadoBusqueda);
        if(enUso) {
            throw new EntityReferencedException("La entidad se encuentra en uso, no puede deshabilitarla");
        } else {
            return delete(idEstadoBusqueda);
        }
    }
}
