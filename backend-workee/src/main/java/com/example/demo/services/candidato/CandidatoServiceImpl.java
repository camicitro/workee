package com.example.demo.services.candidato;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.dtos.busquedas.FiltrosCandidatoRequestDTO;
import com.example.demo.dtos.candidato.CandidatoRequestDTO;
import com.example.demo.dtos.seguridad.UsuarioDTO;
import com.example.demo.entities.candidato.Candidato;
import com.example.demo.entities.candidato.CandidatoCV;
import com.example.demo.entities.candidato.CandidatoHabilidad;
import com.example.demo.entities.params.CodigoEstadoUsuario;
import com.example.demo.entities.params.EstadoBusqueda;
import com.example.demo.entities.params.Genero;
import com.example.demo.entities.params.Habilidad;
import com.example.demo.entities.params.Provincia;
import com.example.demo.entities.seguridad.CodigoRol;
import com.example.demo.entities.seguridad.Usuario;
import com.example.demo.entities.seguridad.tokens.TokenConfirmacion;
import com.example.demo.exceptions.EntityNotFoundException;
import com.example.demo.exceptions.EntityNotValidException;
import com.example.demo.mappers.CandidatoMapper;
import com.example.demo.repositories.candidato.CandidatoRepository;
import com.example.demo.repositories.seguridad.tokens.TokenConfirmacionRepository;
import com.example.demo.services.BaseServiceImpl;
import com.example.demo.services.mail.MailService;
import com.example.demo.services.params.EstadoBusquedaService;
import com.example.demo.services.params.GeneroService;
import com.example.demo.services.params.HabilidadService;
import com.example.demo.services.params.ProvinciaService;
import com.example.demo.services.seguridad.UsuarioService;

import jakarta.transaction.Transactional;

@Service
public class CandidatoServiceImpl extends BaseServiceImpl<Candidato, Long> implements CandidatoService {

    private final CandidatoRepository candidatoRepository;
    private final CandidatoMapper candidatoMapper;
    private final ProvinciaService provinciaService;
    private final GeneroService generoService;
    private final EstadoBusquedaService estadoBusquedaService;
    private final HabilidadService habilidadService;
    private final CandidatoCVService candidatoCVService;
     private final UsuarioService usuarioService;
    private final MailService mailService;
    private final TokenConfirmacionRepository tokenConfirmacionRepository;


    public CandidatoServiceImpl(CandidatoRepository candidatoRepository, CandidatoMapper candidatoMapper, ProvinciaService provinciaService, GeneroService generoService, EstadoBusquedaService estadoBusquedaService, HabilidadService habilidadService, CandidatoCVService candidatoCVService, UsuarioService usuarioService, MailService mailService, TokenConfirmacionRepository tokenConfirmacionRepository) {
        super(candidatoRepository);
        this.candidatoRepository = candidatoRepository;
        this.candidatoMapper = candidatoMapper;
        this.provinciaService = provinciaService;
        this.generoService = generoService;
        this.estadoBusquedaService = estadoBusquedaService;
        this.habilidadService = habilidadService;
        this.candidatoCVService = candidatoCVService;
        this.usuarioService = usuarioService;
        this.mailService = mailService;
        this.tokenConfirmacionRepository = tokenConfirmacionRepository;
    }

    @Override
    @Transactional
    public Candidato crearCandidato(CandidatoRequestDTO candidatoDTO) {
        if(!candidatoDTO.getContrasenia().equals(candidatoDTO.getRepetirContrasenia())) {
            throw new EntityNotValidException("Las contraseñas deben coincidir");
        }
        //Creo el nuevo candidato a partir del DTO
        Candidato nuevoCandidato = candidatoMapper.toEntity(candidatoDTO);

        //Seteo los Atributos complejos
        Provincia provincia = provinciaService.findById(candidatoDTO.getIdProvincia());
        Genero genero = generoService.findById(candidatoDTO.getIdGenero());
        
        //Creacion de usuario
        UsuarioDTO usuarioDTO = new UsuarioDTO(candidatoDTO.getCorreoCandidato(), candidatoDTO.getContrasenia(), candidatoDTO.getUrlFotoPerfil(), CodigoEstadoUsuario.PENDIENTE, CodigoRol.CANDIDATO);
        Usuario nuevoUsuario = usuarioService.registrarUsuario(usuarioDTO);
        
        if(candidatoDTO.getIdEstadoBusqueda() != null){
            EstadoBusqueda estadoBusqueda = estadoBusquedaService.findById(candidatoDTO.getIdEstadoBusqueda());
            nuevoCandidato.setEstadoBusqueda(estadoBusqueda);
        }
        
        //Seteo las habilidades
        if(candidatoDTO.getIdHabilidades() != null && !candidatoDTO.getIdHabilidades().isEmpty()) {
            List<CandidatoHabilidad> habilidades = candidatoDTO.getIdHabilidades().stream()
            .distinct()
            .map(idHabilidad -> {
                Habilidad habilidad = habilidadService.findById(idHabilidad);
                CandidatoHabilidad candidatoHabilidad = new CandidatoHabilidad();
                candidatoHabilidad.setHabilidad(habilidad);
                candidatoHabilidad.setFechaHoraAlta(new Date());    
                return candidatoHabilidad;
            })
            .collect(Collectors.toList());

            nuevoCandidato.setHabilidades(habilidades);
        } else {
            nuevoCandidato.setHabilidades(new ArrayList<>());
        }

        //Setear el CV 
        if(candidatoDTO.getEnlaceCV() != null && !candidatoDTO.getEnlaceCV().isEmpty()) {
            CandidatoCV candidatoCV = candidatoCVService.actualizarOCrearCV(nuevoCandidato, candidatoDTO.getEnlaceCV());
            nuevoCandidato.setCandidatoCV(candidatoCV);
        }

        nuevoCandidato.setFechaHoraAlta(new Date());
        nuevoCandidato.setProvincia(provincia);
        nuevoCandidato.setGenero(genero);

        nuevoCandidato.setUsuario(nuevoUsuario);
        
        candidatoRepository.save(nuevoCandidato);

        //Parte del token
        String token = UUID.randomUUID().toString();
        TokenConfirmacion tokenConfirmacion = new TokenConfirmacion();
        tokenConfirmacion.setToken(token);
        LocalDateTime fechaCreacion = LocalDateTime.now();
        tokenConfirmacion.setFechaCreacion(fechaCreacion);
        tokenConfirmacion.setFechaExpiracion(fechaCreacion.plusMinutes(30));
        tokenConfirmacion.setUsuario(nuevoUsuario);
        tokenConfirmacionRepository.save(tokenConfirmacion);

        String linkConfirmacion = "http://localhost:4200/cuentaVerificada?token=" + token; //TODO: Ver si lo dejamos asi

        //Envio mail
        enviarMailConfirmacionACandidato(candidatoDTO.getCorreoCandidato(), candidatoDTO.getNombreCandidato(), linkConfirmacion);
        
        return nuevoCandidato;

    }

    private void enviarMailConfirmacionACandidato(String mailTo, String nombreCandidato, String urlConfirmacion){
        String templateName = "mailConfirmacionCandidato"; 
        Map<String, Object> variables = new HashMap<>();

        variables.put("nombreCandidato", nombreCandidato);
        variables.put("urlConfirmacion", urlConfirmacion);

        String subject = "¡Bienvenido a Workee! Confirma tu cuenta.";
        mailService.enviar(mailTo, subject, templateName, variables);
    }

 
    @Override
    @Transactional
    public Candidato modificarCandidato(Long idCandidato, CandidatoRequestDTO candidatoDTO) {
        
        Candidato candidatoOriginal = findById(idCandidato);
        candidatoMapper.updateEntityFromDto(candidatoDTO, candidatoOriginal);
        
        if(candidatoDTO.getIdProvincia() != null && candidatoOriginal.getProvincia().getId() != candidatoDTO.getIdProvincia()) {
            Provincia nuevaProvincia = provinciaService.findById(candidatoDTO.getIdProvincia());
            candidatoOriginal.setProvincia(nuevaProvincia);
        }
        if(candidatoDTO.getIdEstadoBusqueda() != null && candidatoOriginal.getEstadoBusqueda().getId() != candidatoDTO.getIdEstadoBusqueda()) {
            EstadoBusqueda estadoBusqueda = estadoBusquedaService.findById(candidatoDTO.getIdEstadoBusqueda());
            candidatoOriginal.setEstadoBusqueda(estadoBusqueda);
        }
        if(candidatoDTO.getIdGenero() != null && candidatoOriginal.getGenero().getId() != candidatoDTO.getIdGenero()) {
            Genero genero = generoService.findById(candidatoDTO.getIdGenero());
            candidatoOriginal.setGenero(genero);
        }

        // Actualizar habilidades
        actualizarHabilidadesCandidato(candidatoOriginal, candidatoDTO);
     
        // Actualizar o crear CV
        candidatoCVService.actualizarOCrearCV(candidatoOriginal, candidatoDTO.getEnlaceCV());

        //actualizar lo relacionado al usuario
        usuarioService.actualizarFotoPerfilUsuario(candidatoOriginal.getUsuario().getId(), candidatoDTO.getUrlFotoPerfil());

        return candidatoRepository.save(candidatoOriginal);
    }

    @Override
    @Transactional
    public Candidato findById(Long id) {
        Candidato candidato = candidatoRepository.findByIdWithHabilidades(id)
            .orElseThrow(() -> new EntityNotFoundException("Candidato no encontrado con ID: " + id));

        List<CandidatoHabilidad> activas = candidato.getHabilidades().stream()
            .filter(ch -> ch.getFechaHoraBaja() == null)
            .toList();

        candidato.getHabilidades().clear();
        candidato.getHabilidades().addAll(activas);

        return candidato;
    }
  
    @Override
    @Transactional
    public List<Candidato> obtenerCandidatos() {
        List<Candidato> listaCandidatos = candidatoRepository.findAllByOrderByNombreCandidatoAsc();
        return listaCandidatos;
    }
 
    private void actualizarHabilidadesCandidato(Candidato candidato,  CandidatoRequestDTO dto) {
        if (dto.getIdHabilidades() == null) return;

        Set<Long> nuevasIds = new HashSet<>(dto.getIdHabilidades());

        // Inicializar la lista si es null
        if (candidato.getHabilidades() == null) {
            candidato.setHabilidades(new ArrayList<>());
        }

        Map<Long, CandidatoHabilidad> mapaActuales = mapearHabilidadesPorId(candidato);
        
        procesarBajasYReactivaciones(mapaActuales, nuevasIds);

        agregarNuevasHabilidades(candidato, nuevasIds, mapaActuales);
    }

    private void agregarNuevasHabilidades(Candidato candidato, Set<Long> nuevasIds, Map<Long, CandidatoHabilidad> actuales) {
        for (Long idNueva : nuevasIds) {
            if (!actuales.containsKey(idNueva)) {
                Habilidad habilidad = habilidadService.findById(idNueva);
                CandidatoHabilidad candidatoHabilidad = new CandidatoHabilidad();
                candidatoHabilidad.setHabilidad(habilidad);
                candidatoHabilidad.setFechaHoraAlta(new Date());
                candidatoHabilidad.setFechaHoraBaja(null); 
                candidato.getHabilidades().add(candidatoHabilidad);
            }
        }
    }

    private void procesarBajasYReactivaciones(Map<Long, CandidatoHabilidad> actuales, Set<Long> nuevasIds) {
        for (CandidatoHabilidad ch : actuales.values()) {
            Long idHabilidad = ch.getHabilidad().getId();
            if (!nuevasIds.contains(idHabilidad)) {
                // Si la habilidad no está en nuevasIds, marcar como baja
                ch.setFechaHoraBaja(new Date());
            } else {
                // Si la habilidad está en nuevasIds, reactivar si estaba dada de baja
                if (ch.getFechaHoraBaja() != null) {
                    ch.setFechaHoraBaja(null);
                }
                
            }
        }
    }

    private Map<Long, CandidatoHabilidad> mapearHabilidadesPorId(Candidato candidato) {
        return candidato.getHabilidades()
            .stream()
            .collect(Collectors.toMap(
                ch -> ch.getHabilidad().getId(),
                ch -> ch
            ));
    }

    @Override
    @Transactional
    public void actualizaroCrearCV(Long idCandidato, String cv) {
        Candidato candidato = findById(idCandidato);
        candidatoCVService.actualizarOCrearCV(candidato, cv);
    }

    @Override
    @Transactional
    public void eliminarCv(Long idCandidato){
        Candidato candidato = findById(idCandidato);
        if (candidato.getCandidatoCV() != null) {
            candidatoCVService.delete(candidato.getCandidatoCV().getId());
            //candidato.setCandidatoCV(null);
            candidatoRepository.save(candidato);
        } else {
            throw new EntityNotFoundException("El candidato no tiene un CV asociado.");
        }
    }

    @Override
    @Transactional
    public List<Habilidad> obtenerHabilidades(Long idCandidato) {
        Candidato candidato = candidatoRepository.findByIdWithHabilidades(idCandidato)
            .orElseThrow(() -> new EntityNotFoundException("Candidato no encontrado con ID " + idCandidato));        

        return candidato.getHabilidades()
                        .stream()
                        .filter(ch -> ch.getFechaHoraBaja() == null)   
                        .map(CandidatoHabilidad::getHabilidad)
                        .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<Habilidad> obtenerHabilidadesPorTipo(Long idCandidato, Long idTipoHabilidad) {
        Candidato candidato = candidatoRepository.findByIdWithHabilidades(idCandidato)
            .orElseThrow(() -> new EntityNotFoundException("Candidato no encontrado con ID " + idCandidato));

        return candidato.getHabilidades()
                        .stream()
                        .filter(ch -> ch.getFechaHoraBaja() == null)   
                        .map(CandidatoHabilidad::getHabilidad)
                        .filter(h -> h.getTipoHabilidad().getId().equals(idTipoHabilidad))
                        .collect(Collectors.toList());  
    }

    @Override
    public List<Candidato> buscarCandidatosConFiltros(FiltrosCandidatoRequestDTO filtrosCandidatoRequestDTO){
        return candidatoRepository.buscarCandidatosConFiltros(filtrosCandidatoRequestDTO.getNombreCandidato(), filtrosCandidatoRequestDTO.getIdsHabilidades(), filtrosCandidatoRequestDTO.getIdsProvincias(), filtrosCandidatoRequestDTO.getIdsPaises(), filtrosCandidatoRequestDTO.getIdsEstadosDeBusqueda());
    }

    @Override
    public List<Candidato> buscarCandidatosPorNombre(String nombreCandidato){
        if(nombreCandidato.isBlank() || nombreCandidato == null){
            throw new IllegalArgumentException("El nombre del candidato no puede estar vacío");
        }
        return candidatoRepository.buscarCandidatosPorNombre(nombreCandidato);
    }

    @Override
    public Optional<Candidato> buscarCandidatoPorIdUsuario(Long idUsuario){
        if(idUsuario == null){
            throw new IllegalArgumentException("El id del usuario no puede estar vacío");
        }
        Optional<Candidato> candidato = candidatoRepository.findByUsuarioId(idUsuario);
        return candidato;
    }
    @Override
    public Candidato traerPerfilCandidatoPorUsuario(Long idUsuario){
        Optional<Candidato> candidatoOptional = this.buscarCandidatoPorIdUsuario(idUsuario);
        if(!candidatoOptional.isPresent()){
            throw new EntityNotFoundException("No se encontró un candidato con el perfil buscado");
        }
        Candidato candidato = candidatoOptional.get();
        List<CandidatoHabilidad> candidatoHabilidad = candidato.getHabilidades().stream()
            .filter(ch -> ch.getFechaHoraBaja() == null)
            .toList();
        candidato.getHabilidades().clear();
        candidato.getHabilidades().addAll(candidatoHabilidad);
        return candidato;
    }

    @Override
    @Transactional
    public Boolean eliminarCuentaCandidato(Long idCandidato){
        Candidato candidato = findById(idCandidato);
        candidato.setFechaHoraBaja(new Date());
        usuarioService.darDeBajaUsuario(candidato.getUsuario().getId());
        candidatoRepository.save(candidato);
        return true;
    }

    @Override
    public Boolean existeCandidatoPorUsuarioId(Long usuarioId){
        return candidatoRepository.existsByUsuarioId(usuarioId);
    }
}   