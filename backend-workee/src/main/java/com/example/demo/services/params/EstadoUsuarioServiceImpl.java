package com.example.demo.services.params;

import java.text.Normalizer;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.dtos.params.EstadoUsuarioRequestDTO;
import com.example.demo.entities.params.EstadoUsuario;
import com.example.demo.exceptions.EntityAlreadyEnabledException;
import com.example.demo.exceptions.EntityAlreadyExistsException;
import com.example.demo.exceptions.EntityNotFoundException;
import com.example.demo.exceptions.EntityReferencedException;
import com.example.demo.repositories.params.EstadoUsuarioRepository;
import com.example.demo.repositories.seguridad.UsuarioEstadoUsuarioRepository;
import com.example.demo.services.BaseServiceImpl;

import jakarta.transaction.Transactional;
 
@Service
public class EstadoUsuarioServiceImpl extends BaseServiceImpl<EstadoUsuario,Long> implements EstadoUsuarioService {
    private final EstadoUsuarioRepository estadoUsuarioRepository;
    private final UsuarioEstadoUsuarioRepository usuarioEstadoUsuarioRepository;

    public EstadoUsuarioServiceImpl(EstadoUsuarioRepository estadoUsuarioRepository, UsuarioEstadoUsuarioRepository usuarioEstadoUsuarioRepository) {
        super(estadoUsuarioRepository);
        this.estadoUsuarioRepository = estadoUsuarioRepository;
        this.usuarioEstadoUsuarioRepository = usuarioEstadoUsuarioRepository;
    }

    @Override
    @Transactional
    public EstadoUsuario guardarEstadoUsuario(EstadoUsuarioRequestDTO estadoUsuarioRequestDTO) {
        if(yaExisteEstadoUsuario(estadoUsuarioRequestDTO.getNombreEstadoUsuario(), null)) {
            throw new EntityAlreadyExistsException("El estado de usuario ya existe");
        }
        EstadoUsuario estadoUsuario = new EstadoUsuario();
        estadoUsuario.setNombreEstadoUsuario(estadoUsuarioRequestDTO.getNombreEstadoUsuario());
        estadoUsuario.setFechaHoraAlta(new Date());

        //Generar un codigo para identificarlo
        String codigoEstadoUsuario = generarCodigoUnico(estadoUsuarioRequestDTO.getNombreEstadoUsuario());
        estadoUsuario.setCodigoEstadoUsuario(codigoEstadoUsuario);
        
        return estadoUsuarioRepository.save(estadoUsuario);
    }

    private String generarCodigoUnico(String nombreEstadoUsuario){
        String base = normalizar(nombreEstadoUsuario);
        String codigoEstado = base;
        int contador = 1;

        while(estadoUsuarioRepository.existsByCodigoEstadoUsuario(codigoEstado)){
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
    public EstadoUsuario actualizarEstadoUsuario(Long id, EstadoUsuarioRequestDTO estadoUsuarioRequestDTO) {
        if(estadoUsuarioRequestDTO.getNombreEstadoUsuario() == null || estadoUsuarioRequestDTO.getNombreEstadoUsuario().isEmpty()) {
            throw new IllegalArgumentException("El nombre del estado de usuario no puede estar vacío");
        }
        EstadoUsuario estadoUsuarioOriginal = findById(id);//buscarEstadoUsuarioPorId(id);
        if(yaExisteEstadoUsuario(estadoUsuarioRequestDTO.getNombreEstadoUsuario(), estadoUsuarioOriginal.getId())) {
            throw new EntityAlreadyExistsException("El estado de usuario ya existe");
        } else {
            estadoUsuarioOriginal.setNombreEstadoUsuario(estadoUsuarioRequestDTO.getNombreEstadoUsuario());
            return estadoUsuarioRepository.save(estadoUsuarioOriginal);
        }
    }

    @Override
    public List<EstadoUsuario> obtenerEstadosUsuario() {
        return estadoUsuarioRepository.findAllByOrderByNombreEstadoUsuarioAsc();
    }

    @Override
    public List<EstadoUsuario> obtenerEstadosUsuarioActivos() {
        return estadoUsuarioRepository.buscarEstadosActivos();
    }

    @Override
    @Transactional
    public Boolean habilitarEstadoUsuario(Long id) {
        if(id == null) {
            throw new IllegalArgumentException("El ID no puede ser nulo");
        }
        EstadoUsuario estadoUsuario = findById(id);//buscarEstadoUsuarioPorId(id);
        if(estadoUsuario.getFechaHoraBaja() == null) {
            throw new EntityAlreadyEnabledException("El estado de usuario ya está habilitado");
        }
        estadoUsuario.setFechaHoraBaja(null);
        estadoUsuarioRepository.save(estadoUsuario);
        return true;
    }
    

    public Boolean yaExisteEstadoUsuario(String nombreEstadoUsuario, Long idEstadoUsuarioOriginal) {
        Optional<EstadoUsuario> estadoUsuarioExistente = estadoUsuarioRepository.findByNombreEstadoUsuarioIgnoreCase(nombreEstadoUsuario);
        if(idEstadoUsuarioOriginal != null && estadoUsuarioExistente.isPresent()){
            if(idEstadoUsuarioOriginal == estadoUsuarioExistente.get().getId()){
            return false;
            }
        }
        
        return estadoUsuarioExistente.isPresent();
    }

    @Override
    public EstadoUsuario obtenerEstadoPorCodigo(String codigoEstado){
        EstadoUsuario estadoUsuario = estadoUsuarioRepository.findByCodigoEstadoUsuarioAndFechaHoraBajaIsNull(codigoEstado);
        if(estadoUsuario == null){
            throw new EntityNotFoundException("No se encontró el estado usuario buscado");
        }
        return estadoUsuario;
    }

    @Override
    public Boolean deshabilitarEstadoUsuario(Long id){
        Boolean estaEnUso = usuarioEstadoUsuarioRepository.existsUsuariosActivosConEstado(id) > 0;

        if(estaEnUso){
            throw new EntityReferencedException("La entidad se encuentra en uso, no puede deshabilitarla");
        }
        
        return delete(id);
    }
}

                
