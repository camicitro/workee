package com.example.demo.services.params;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.dtos.params.RubroRequestDTO;
import com.example.demo.entities.params.Rubro;
import com.example.demo.exceptions.EntityAlreadyEnabledException;
import com.example.demo.exceptions.EntityAlreadyExistsException;
import com.example.demo.exceptions.EntityNotValidException;
import com.example.demo.exceptions.EntityReferencedException;
import com.example.demo.repositories.empresa.EmpresaRepository;
import com.example.demo.repositories.params.RubroRepository;
import com.example.demo.services.BaseServiceImpl;

import jakarta.transaction.Transactional;

@Service
public class RubroServiceImpl extends BaseServiceImpl<Rubro, Long> implements RubroService {

    private final RubroRepository rubroRepository;
    private final EmpresaRepository empresaRepository;

    public RubroServiceImpl(RubroRepository rubroRepository, EmpresaRepository empresaRepository) {
        super(rubroRepository);
        this.rubroRepository = rubroRepository;
        this.empresaRepository = empresaRepository;
    }   

    @Override
    @Transactional
    public Rubro guardarRubro(RubroRequestDTO rubroDTO) {
        if(yaExisteRubro(rubroDTO.getNombreRubro(), null)) {
            throw new EntityAlreadyExistsException("Ya existe un rubro con ese nombre");
        }

        Rubro nuevoRubro = new Rubro();
        nuevoRubro.setNombreRubro(rubroDTO.getNombreRubro());
        nuevoRubro.setFechaHoraAlta(new Date());

        return rubroRepository.save(nuevoRubro);
    }

    @Override
    @Transactional
    public Rubro actualizarRubro(Long id, RubroRequestDTO rubroDTO) {
        Rubro rubroOriginal = this.findById(id);

        if(yaExisteRubro(rubroDTO.getNombreRubro(), id)) {
            throw new EntityAlreadyExistsException("Ya existe un rubro con ese nombre");
        }

        rubroOriginal.setNombreRubro(rubroDTO.getNombreRubro());
        return rubroRepository.save(rubroOriginal);
    }

    @Override
    @Transactional
        public Boolean habilitarRubro(Long id) {
        if(id == null) {
            throw new EntityNotValidException("El ID del rubro no puede ser nulo");
        }

        Rubro rubro = this.findById(id);
        
        if (rubro.getFechaHoraBaja() == null) {
            throw new EntityAlreadyEnabledException("El rubro ya está habilitado");
        }

        rubro.setFechaHoraBaja(null);
        rubroRepository.save(rubro);
        return true;
    }

    @Override
    public List<Rubro> obtenerRubros() {
        return rubroRepository.findAllByOrderByNombreRubroAsc();
    }
    
    @Override
    public List<Rubro> obtenerRubrosActivos() {
        return rubroRepository.buscarRubrosActivos();
    }

    public Boolean yaExisteRubro(String nombreRubro, Long idAExcluir) {
        Optional<Rubro> rubroExiste = rubroRepository.findByNombreRubroIgnoreCase(nombreRubro);
        return rubroExiste
        .filter(e -> idAExcluir == null || !e.getId().equals(idAExcluir))
        .isPresent();    }


    @Override
    @Transactional
    public Boolean deshabilitarRubro(Long idRubro){
        Boolean estaEnUso = validarUsoRubro(idRubro);
        if(estaEnUso){
            throw new EntityReferencedException("La entidad se encuentra en uso, no puede deshabilitarla");
        }
        return delete(idRubro);
    }
    
    private Boolean validarUsoRubro(Long idRubro){
        return empresaRepository.existsByRubroIdAndFechaHoraBajaIsNull(idRubro);
    }   
}
