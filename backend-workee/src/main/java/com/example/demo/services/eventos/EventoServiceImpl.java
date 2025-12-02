package com.example.demo.services.eventos;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.example.demo.dtos.eventos.EventoRequestDTO;
import com.example.demo.entities.eventos.Evento;
import com.example.demo.entities.eventos.TipoNotificacion;
import com.example.demo.entities.params.CodigoTipoEvento;
import com.example.demo.entities.params.TipoEvento;
import com.example.demo.entities.postulaciones.PostulacionOferta;
import com.example.demo.entities.postulaciones.PostulacionOfertaEtapa;
import com.example.demo.entities.seguridad.Usuario;
import com.example.demo.entities.videollamadas.Videollamada;
import com.example.demo.exceptions.EntityNotFoundException;
import com.example.demo.repositories.eventos.EventoRepository;
import com.example.demo.services.BaseServiceImpl;
import com.example.demo.services.params.TipoEventoService;
import com.example.demo.services.postulaciones.PostulacionOfertaEtapaService;
import com.example.demo.services.postulaciones.PostulacionOfertaService;
import com.example.demo.services.seguridad.UsuarioService;
import com.example.demo.services.videollamadas.VideollamadaService;

import jakarta.transaction.Transactional;

@Service
public class EventoServiceImpl extends BaseServiceImpl<Evento, Long> implements EventoService{


    private final EventoRepository eventoRepository;
    private final TipoEventoService tipoEventoService;
    private final PostulacionOfertaEtapaService postulacionOfertaEtapaService;
    private final UsuarioService usuarioService;
    private final NotificacionService notificacionService;
    private final PostulacionOfertaService postulacionOfertaService;
    private final VideollamadaService videollamadaService;

    public EventoServiceImpl(EventoRepository eventoRepository, TipoEventoService tipoEventoService, PostulacionOfertaEtapaService postulacionOfertaEtapaService, 
    UsuarioService usuarioService, NotificacionService notificacionService, PostulacionOfertaService postulacionOfertaService, VideollamadaService videollamadaService) {
        super(eventoRepository);
        this.eventoRepository = eventoRepository;
        this.tipoEventoService = tipoEventoService;
        this.postulacionOfertaEtapaService = postulacionOfertaEtapaService;
        this.usuarioService = usuarioService;
        this.notificacionService = notificacionService;
        this.postulacionOfertaService = postulacionOfertaService;
        this.videollamadaService = videollamadaService;
    }

    @Override
    @Transactional
    public Evento crearEvento(EventoRequestDTO evento) {

        TipoEvento tipoEvento = tipoEventoService.findById(evento.getIdTipoEvento());
        PostulacionOfertaEtapa postulacionOfertaEtapa = postulacionOfertaEtapaService.findById(evento.getIdPostulacionOfertaEtapa());
        Usuario usuarioCandidato = usuarioService.findById(evento.getIdUsuarioCandidato());
        Usuario usuarioEmpleado = usuarioService.findById(evento.getIdUsuarioEmpleado());

        Evento nuevoEvento = new Evento();
        nuevoEvento.setNombreEvento(evento.getNombreEvento());
        nuevoEvento.setDescripcionEvento(evento.getDescripcionEvento());
        nuevoEvento.setFechaHoraInicioEvento(evento.getFechaHoraInicioEvento());
        nuevoEvento.setFechaHoraFinEvento(evento.getFechaHoraFinEvento()); // opcional
        nuevoEvento.setFechaHoraAlta(new Date());
        nuevoEvento.setTipoEvento(tipoEvento);
        nuevoEvento.setPostulacionOfertaEtapa(postulacionOfertaEtapa);
        
        // Setear usuarios relacionados
        nuevoEvento.setUsuarioCandidato(usuarioCandidato);
        nuevoEvento.setUsuarioEmpleado(usuarioEmpleado);
        
        /// Si es videollamada, instanciar la relación
        if (CodigoTipoEvento.VIDEOLLAMADA.equalsIgnoreCase(tipoEvento.getCodigoTipoEvento())) {
            Videollamada videollamada = videollamadaService.crearVideollamada(evento);
            nuevoEvento.setVideollamada(videollamada);
        }

        Evento eventoGuardado = eventoRepository.save(nuevoEvento);

        // Crear Notificacion de Nuevo evento
        PostulacionOferta postulacionOferta = postulacionOfertaService.obtenerPorEtapaId(postulacionOfertaEtapa.getId())
            .orElseThrow(() -> new EntityNotFoundException("No se encontró la Postulación para el evento"));
        
        Map<String, Object> datosNotificacion = new HashMap<>();
        datosNotificacion.put("titulo", evento.getNombreEvento());  
        datosNotificacion.put("oferta", postulacionOferta.getOferta().getTitulo()); 
        datosNotificacion.put("empresa", postulacionOferta.getOferta().getEmpresa().getNombreEmpresa());
        datosNotificacion.put("candidato", postulacionOferta.getCandidato().getNombreCandidato());

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        LocalDateTime fechaEvento = eventoGuardado.getFechaHoraInicioEvento();
        datosNotificacion.put("fecha", fechaEvento.format(dateFormatter));
        datosNotificacion.put("horas", fechaEvento.format(timeFormatter));
    
        // Notificación al candidato
        notificacionService.crearNotificacion(
            CodigoTipoEvento.VIDEOLLAMADA.equalsIgnoreCase(tipoEvento.getCodigoTipoEvento())
                ? TipoNotificacion.EVENTO_VIDEOLLAMADA
                : TipoNotificacion.EVENTO_ENTREGA,
            datosNotificacion,
            usuarioCandidato,
            eventoGuardado,
            LocalDateTime.now(),
            postulacionOferta
        );

        // Programar recordatorios (para candidato y empleado)
        LocalDateTime inicioEvento = fechaEvento;
        LocalDateTime ahora = LocalDateTime.now();

        long diasRestantes = ChronoUnit.DAYS.between(ahora, inicioEvento);

        LocalDateTime tresDiasAntes = inicioEvento.minusDays(3);
        LocalDateTime unDiaAntes = inicioEvento.minusDays(1);

        //Recordatorios para el Candidato
        if (usuarioCandidato != null) {
            // Solo crear si FALTA más de 3 días
            if (diasRestantes> 3) {
                notificacionService.crearNotificacion(
                    TipoNotificacion.RECORDATORIO_EVENTO_3_DIAS_CANDIDATO,
                    datosNotificacion,
                    usuarioCandidato,
                    eventoGuardado,
                    tresDiasAntes,
                    postulacionOferta
                );
            }

            // Solo crear si FALTA más de 1 día
            if (diasRestantes > 1) {
                notificacionService.crearNotificacion(
                    TipoNotificacion.RECORDATORIO_EVENTO_1_DIA_CANDIDATO,
                    datosNotificacion,
                    usuarioCandidato,
                    eventoGuardado,
                    unDiaAntes,
                    postulacionOferta
                );
            }
        }

        //Recordatorios para el Empleado
        if (usuarioEmpleado != null) {
            if (diasRestantes > 3) {
                notificacionService.crearNotificacion(
                    TipoNotificacion.RECORDATORIO_EVENTO_3_DIAS_EMPRESA,
                    datosNotificacion,
                    usuarioEmpleado,
                    eventoGuardado,
                    tresDiasAntes,
                    postulacionOferta
                );
            }

            if (diasRestantes > 1) {
                notificacionService.crearNotificacion(
                    TipoNotificacion.RECORDATORIO_EVENTO_1_DIA_EMPRESA,
                    datosNotificacion,
                    usuarioEmpleado,
                    eventoGuardado,
                    unDiaAntes,
                    postulacionOferta
                );
            }
        }
        return eventoGuardado;
    }

    @Override
    @Transactional
    public Evento modificarEvento(Long id, EventoRequestDTO eventoRequestDTO) {
        if(id == null) {
            throw new IllegalArgumentException("El ID no puede ser nulo");
        }

        Evento evento = findById(id);
    
        if(!evento.getFechaHoraInicioEvento().equals(eventoRequestDTO.getFechaHoraInicioEvento())){
            evento.setFechaHoraInicioEvento(eventoRequestDTO.getFechaHoraInicioEvento());
            evento.setFechaHoraFinEvento(eventoRequestDTO.getFechaHoraFinEvento()); // opcional
            
            //TODO: Notificar cambios de horario a los usuarios involucrados
            PostulacionOferta postulacionOferta = postulacionOfertaService.obtenerPorEtapaId(evento.getPostulacionOfertaEtapa().getId())
                .orElseThrow(() -> new EntityNotFoundException("No se encontró la Postulación para el evento"));

            Map<String, Object> datosNotificacion = new HashMap<>();
            datosNotificacion.put("titulo", evento.getNombreEvento());
            datosNotificacion.put("oferta", postulacionOferta.getOferta().getTitulo()); 
            datosNotificacion.put("empresa", postulacionOferta.getOferta().getEmpresa().getNombreEmpresa());
            
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

            LocalDateTime inicio = eventoRequestDTO.getFechaHoraInicioEvento();
            datosNotificacion.put("fecha", inicio.format(dateFormatter));
            datosNotificacion.put("horas", inicio.format(timeFormatter));

            if (evento.getUsuarioCandidato() != null) {
                notificacionService.crearNotificacion(
                    TipoNotificacion.EVENTO_MODIFICADO,
                    datosNotificacion, 
                    evento.getUsuarioCandidato(),     
                    evento,
                    LocalDateTime.now(),
                    postulacionOferta
                );        
            }

            //TODO: Reprogramar recordatorios
        }  
        if (!evento.getDescripcionEvento().equals(eventoRequestDTO.getDescripcionEvento())) {
            evento.setDescripcionEvento(eventoRequestDTO.getDescripcionEvento());;
        }

        return eventoRepository.save(evento);
    }

    @Override
    @Transactional
    public void eliminarEvento(Long idEvento) {
        if(idEvento == null) {
            throw new IllegalArgumentException("El ID no puede ser nulo");
        }
        Evento evento = findById(idEvento);
        PostulacionOferta postulacionOferta = postulacionOfertaService.obtenerPorEtapaId(evento.getPostulacionOfertaEtapa().getId())
            .orElseThrow(() -> new EntityNotFoundException("No se encontró la Postulación para el evento"));

        Map<String, Object> datosNotificacion = new HashMap<>();
        datosNotificacion.put("titulo", evento.getNombreEvento());
        datosNotificacion.put("oferta", postulacionOferta.getOferta().getTitulo()); 
        datosNotificacion.put("empresa", postulacionOferta.getOferta().getEmpresa().getNombreEmpresa());

        if (evento.getUsuarioCandidato() != null) {
            notificacionService.crearNotificacion(
                TipoNotificacion.EVENTO_ELIMINADO,
                datosNotificacion, 
                evento.getUsuarioCandidato(),     
                evento, 
                LocalDateTime.now(),
                postulacionOferta 
            );        
        }

        eventoRepository.delete(evento); 
    }
    
    @Override
    @Transactional
    public List<Evento> obtenerEventosPorUsuario(Long idUsuario) {
        if(idUsuario == null) {
            throw new IllegalArgumentException("El ID del usuario no puede ser nulo");
        }

        List<Evento> listaEventos = eventoRepository.findEventosActivosPorUsuario(idUsuario);

        if (listaEventos.isEmpty()) {
            throw new EntityNotFoundException("No se encontraron Eventos para el Usuario con ID  " + idUsuario);
        }

        return listaEventos;
    }

    @Override
    @Transactional
    public List<Evento> obtenerEventosPorEmpresa(Long idEmpresa) {
        if(idEmpresa == null) {
            throw new IllegalArgumentException("El ID de la empresa no puede ser nulo");
        }

        List<Evento> listaEventos = eventoRepository.findEventosByEmpresaIdAndFechaHoraBajaIsNull(idEmpresa);

        if (listaEventos.isEmpty()) {
            throw new EntityNotFoundException("No se encontraron Eventos para la Empresa con ID  " + idEmpresa);
        }

        return listaEventos;
    }

    @Override
    @Transactional
    public List<Evento> obtenerEventosEntreFechas(LocalDateTime desde, LocalDateTime hasta) {
        if(desde == null || hasta == null) {
            throw new IllegalArgumentException("Las fechas no pueden ser nulas");
        }
        if(desde.isAfter(hasta)) {
            throw new IllegalArgumentException("La fecha 'desde' no puede ser posterior a la fecha 'hasta'");
        }

        List<Evento> listaEventos = eventoRepository.findEventosEntreFechasAndFechaHoraBajaIsNull(desde, hasta);

        if (listaEventos.isEmpty()) {
            throw new EntityNotFoundException("No se encontraron Eventos entre las fechas proporcionadas");
        }

        return listaEventos;
    }

    @Override
    @Transactional
    public List<Evento> obtenerEventosPorPostulacion(Long idPostulacion) {
        if (idPostulacion == null) {
            throw new IllegalArgumentException("El ID de la postulación no puede ser nulo");
        }

        List<PostulacionOfertaEtapa> etapas = postulacionOfertaService.obtenerEtapasDePostulacion(idPostulacion);

        List<Long> idsEtapas = etapas.stream()
            .map(PostulacionOfertaEtapa::getId)
            .toList();

        List<Evento> eventos = eventoRepository.findEventosActivosPorEtapas(idsEtapas);

        if (eventos.isEmpty()) {
            throw new EntityNotFoundException("No se encontraron eventos para la postulación con ID " + idPostulacion);
        }

        return eventos;
    }


}
