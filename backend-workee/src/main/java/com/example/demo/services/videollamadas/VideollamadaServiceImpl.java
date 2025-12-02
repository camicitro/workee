package com.example.demo.services.videollamadas;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.dtos.eventos.EventoRequestDTO;
import com.example.demo.entities.seguridad.Usuario;
import com.example.demo.entities.videollamadas.DetalleVideollamada;
import com.example.demo.entities.videollamadas.Videollamada;
import com.example.demo.exceptions.EntityNotValidException;
import com.example.demo.repositories.videollamadas.VideollamadaRepository;
import com.example.demo.services.BaseServiceImpl;
import com.example.demo.services.seguridad.UsuarioService;

import jakarta.transaction.Transactional;

@Service
public class VideollamadaServiceImpl extends BaseServiceImpl<Videollamada, Long> implements VideollamadaService {
    private final VideollamadaRepository videollamadaRepository;
    private final UsuarioService usuarioService;

    private String hostLink = "https://workeemeetings.online/";

    public VideollamadaServiceImpl(VideollamadaRepository videollamadaRepository, UsuarioService usuarioService){
        super(videollamadaRepository);
        this.videollamadaRepository = videollamadaRepository;
        this.usuarioService = usuarioService;
    }

    @Override
    @Transactional
    public Videollamada crearVideollamada(EventoRequestDTO datosEvento){
        String enlaceVideollamada = generarEnlaceVideollamadaUnico();

        Videollamada videollamada = new Videollamada(); 
        videollamada.setEnlaceVideollamada(enlaceVideollamada);
        videollamada.setFechaHoraInicioPlanifVideollamada(datosEvento.getFechaHoraInicioEvento());
        videollamada.setFechaHoraFinPlanifVideollamada(datosEvento.getFechaHoraFinEvento());

        //Detalle del candidato
        Usuario usuarioCandidato = usuarioService.findById(datosEvento.getIdUsuarioCandidato());
        DetalleVideollamada detalleCandidato = new DetalleVideollamada();
        detalleCandidato.setFechaHoraAlta(new Date());
        detalleCandidato.setUsuario(usuarioCandidato);

        //Detalle del empleado
        Usuario usuarioEmpleado = usuarioService.findById(datosEvento.getIdUsuarioEmpleado());
        DetalleVideollamada detalleEmpleado = new DetalleVideollamada();
        detalleEmpleado.setFechaHoraAlta(new Date());
        detalleEmpleado.setUsuario(usuarioEmpleado);

        if(videollamada.getDetalleVideollamadaList() == null){
            videollamada.setDetalleVideollamadaList(new java.util.ArrayList<>());
        }
        videollamada.getDetalleVideollamadaList().add(detalleCandidato);
        videollamada.getDetalleVideollamadaList().add(detalleEmpleado);
        //videollamadaRepository.save(videollamada);
        return videollamada;
    }

    @Override
    @Transactional
    public Videollamada finalizarVideollamada(Long idVideollamada){
        Videollamada videollamada = findById(idVideollamada);

        if(videollamada.getFechaHoraFinRealVideollamada() != null){
            throw new EntityNotValidException("La videollamada ya ha sido finalizada.");
        }

        videollamada.setFechaHoraFinRealVideollamada(LocalDateTime.now());
        //videollamada.setFechaHoraBaja(new Date());

        if (videollamada.getFechaHoraInicioRealVideollamada() != null) {
            double durationMiliseg = java.time.Duration.between(
                videollamada.getFechaHoraInicioRealVideollamada(), 
                videollamada.getFechaHoraFinRealVideollamada()
            ).toMillis();
            Double duracionMinutos =  durationMiliseg / 60000.0;  
            videollamada.setDuracionVideollamada((double) duracionMinutos); 
        } else {
            throw new EntityNotValidException("La videollamada no ha sido iniciada aún.");
        }


        videollamadaRepository.save(videollamada);

        return videollamada;
    }


    @Override
    @Transactional
    public Videollamada iniciarVideollamada(Long videollamadaId) {
        Videollamada videollamada = findById(videollamadaId); 
        

        if (videollamada.getFechaHoraInicioRealVideollamada() == null) {
            videollamada.setFechaHoraInicioRealVideollamada(LocalDateTime.now());
        } 
        
        videollamadaRepository.save(videollamada);
        
        return videollamada;
    }


    //Para obtener el enlace final de la llamada (link base + UUID)
    private String generarEnlaceVideollamadaUnico() {
        int attempts = 0;
        String enlace;

        do { 
            if (attempts >= 5) {
                throw new IllegalStateException("No se pudo generar un enlace de videollamada único después de 5 intentos.");
            }
            
            enlace = hostLink + java.util.UUID.randomUUID().toString();
            
            Optional<Videollamada> existente = videollamadaRepository.findByEnlaceVideollamadaAndFechaHoraFinRealVideollamadaIsNull(enlace);
            
            if (!existente.isPresent()) {
                return enlace; 
            }
            
            attempts++;
        } while (true); 
    }
}
