package com.example.demo.services.params;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.dtos.busquedas.UbicacionDTO;
import com.example.demo.dtos.params.ProvinciaRequestDTO;
import com.example.demo.entities.params.Pais;
import com.example.demo.entities.params.Provincia;
import com.example.demo.exceptions.EntityAlreadyEnabledException;
import com.example.demo.exceptions.EntityAlreadyExistsException;
import com.example.demo.exceptions.EntityReferencedException;
import com.example.demo.repositories.candidato.CandidatoRepository;
import com.example.demo.repositories.empresa.EmpresaRepository;
import com.example.demo.repositories.params.ProvinciaRepository;
import com.example.demo.services.BaseServiceImpl;

import jakarta.transaction.Transactional;

@Service
public class ProvinciaServiceImpl extends BaseServiceImpl<Provincia,Long> implements ProvinciaService{

    private final ProvinciaRepository provinciaRepository;
    private final PaisService paisService;
    private final EmpresaRepository empresaRepository; 
    private final CandidatoRepository candidatoRepository;

    public ProvinciaServiceImpl(ProvinciaRepository provinciaRepository, PaisService paisService, EmpresaRepository empresaRepository, CandidatoRepository candidatoRepository) {
        super(provinciaRepository);
        this.provinciaRepository = provinciaRepository;
        this.paisService = paisService;
        this.empresaRepository = empresaRepository;
        this.candidatoRepository = candidatoRepository;
    }

    @Override
    public List<Provincia> findProvinciaByPaisId(Long idPais) {
        return provinciaRepository.findProvinciaByPaisId(idPais);
    }

    @Override
    @Transactional
    public Provincia guardarProvincia(ProvinciaRequestDTO provinciaRequestDTO){
        if(yaExisteProvincia(provinciaRequestDTO.getNombreProvincia(), null)){
            throw new EntityAlreadyExistsException("Ya existe una provincia con ese nombre");
        }

        Provincia nuevaProvincia = new Provincia();
        nuevaProvincia.setNombreProvincia(provinciaRequestDTO.getNombreProvincia());
        nuevaProvincia.setFechaHoraAlta(new Date());

        if(provinciaRequestDTO.getIdPais() == null) {
            throw new IllegalArgumentException("El ID del país no puede ser nulo");
        }
        Pais paisBuscado = paisService.findById(provinciaRequestDTO.getIdPais());

        nuevaProvincia.setPais(paisBuscado);

        return provinciaRepository.save(nuevaProvincia);
    }

    @Override
    @Transactional
    public Provincia actualizarProvincia(Long id, ProvinciaRequestDTO provinciaRequestDTO){
        if(provinciaRequestDTO.getNombreProvincia() == null || provinciaRequestDTO.getNombreProvincia().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la provincia no puede ser nulo o vacío");
        }

        Provincia provinciaOriginal = findById(id);//buscarProvinciaPorId(id);

        if(yaExisteProvincia(provinciaRequestDTO.getNombreProvincia(), provinciaOriginal.getId())){
            throw new EntityAlreadyExistsException("Ya existe una provincia con ese nombre");
        }

        provinciaOriginal.setNombreProvincia(provinciaRequestDTO.getNombreProvincia());

        return provinciaRepository.save(provinciaOriginal);
    }

    @Override
    public List<Provincia> obtenerProvincias(){
        return provinciaRepository.findAllByOrderByNombreProvinciaAsc();
    }

    @Override
    public List<Provincia> obtenerProvinciasActivas(){
        return provinciaRepository.buscarProvinciasActivas();
    }

    @Override
    public List<Provincia> obtenerProvinciasActivasPorPaisId(Long idPais){
        return provinciaRepository.findProvinciasActivasByPaisId(idPais);
    }


    @Override
    @Transactional
    public Boolean habilitarProvincia(Long id){
        if(id == null) {
            throw new IllegalArgumentException("El ID de la provincia no puede ser nulo");
        }
        Provincia provinciaOriginal = findById(id);//buscarProvinciaPorId(id);
        if(provinciaOriginal.getFechaHoraBaja() == null) {
            throw new EntityAlreadyEnabledException("La provincia ya está habilitada");
        }
        provinciaOriginal.setFechaHoraBaja(null);
        provinciaRepository.save(provinciaOriginal);
        return true;
    }


    private Boolean yaExisteProvincia(String nombreProvincia, Long idProvinciaOriginal) {
        Optional<Provincia> provinciaExistente = provinciaRepository.findByNombreProvinciaIgnoreCase(nombreProvincia);
        if(idProvinciaOriginal != null && provinciaExistente.isPresent()){
            if(idProvinciaOriginal == provinciaExistente.get().getId()){
                return false;
            }
        }
        
        return provinciaExistente.isPresent();
    }

    @Override
    public List<UbicacionDTO> traerUbicaciones(){
        List<UbicacionDTO> ubicaciones = provinciaRepository.obtenerUbicaciones();
        return ubicaciones;
    }

    @Override
    public Boolean deshabilitarProvincia(Long id){
        Boolean estaEnUso = validarUsoProvincia(id);

        if(estaEnUso){
            throw new EntityReferencedException("La entidad se encuentra en uso, no puede deshabilitarla");
        }
        return delete(id);
    }

    private Boolean validarUsoProvincia(Long id){
        Boolean provinciaEnUsoPorEmpresas = empresaRepository.existsByProvinciaIdAndFechaHoraBajaIsNull(id);
        Boolean provinciaEnUsoPorCandidato = candidatoRepository.existsByProvinciaIdAndFechaHoraBajaIsNull(id);

        if(provinciaEnUsoPorCandidato || provinciaEnUsoPorEmpresas){
            return true;
        } else {
            return false;
        }
    }
}
