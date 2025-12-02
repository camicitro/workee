package com.example.demo.services.empresa;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.dtos.busquedas.FiltrosEmpresaRequestDTO;
import com.example.demo.dtos.busquedas.ResultadoBusquedaEmpresaDTO;
import com.example.demo.dtos.empresa.EmpresaRequestDTO;
import com.example.demo.dtos.seguridad.EmpresaPendienteHabilitacionDTO;
import com.example.demo.dtos.seguridad.UsuarioDTO;
import com.example.demo.entities.empresa.Empresa;
import com.example.demo.entities.params.CodigoEstadoUsuario;
import com.example.demo.entities.params.EstadoUsuario;
import com.example.demo.entities.params.Provincia;
import com.example.demo.entities.params.Rubro;
import com.example.demo.entities.seguridad.CodigoRol;
import com.example.demo.entities.seguridad.Usuario;
import com.example.demo.entities.seguridad.UsuarioEstadoUsuario;
import com.example.demo.exceptions.EntityNotFoundException;
import com.example.demo.exceptions.EntityNotValidException;
import com.example.demo.mappers.EmpresaMapper;
import com.example.demo.repositories.empresa.EmpresaRepository;
import com.example.demo.services.BaseServiceImpl;
import com.example.demo.services.mail.MailService;
import com.example.demo.services.params.EstadoUsuarioService;
import com.example.demo.services.params.ProvinciaService;
import com.example.demo.services.params.RubroService;
import com.example.demo.services.seguridad.UsuarioService;

import jakarta.transaction.Transactional;

@Service
public class EmpresaServiceImpl extends BaseServiceImpl<Empresa, Long> implements EmpresaService{

    private final EmpresaRepository empresaRepository;
    private final RubroService rubroService;
    private final EmpresaMapper empresaMapper;
    private final UsuarioService usuarioService;
    private final ProvinciaService provinciaService;
    private final MailService mailService;
    private final EstadoUsuarioService estadoUsuarioService;

    public EmpresaServiceImpl(EmpresaRepository empresaRepository, RubroService rubroService, EmpresaMapper empresaMapper, UsuarioService usuarioService, ProvinciaService provinciaService, MailService mailService, EstadoUsuarioService estadoUsuarioService) {
        super(empresaRepository);
        this.empresaRepository = empresaRepository;
        this.rubroService = rubroService;
        this.empresaMapper = empresaMapper;
        this.usuarioService = usuarioService;
        this.provinciaService = provinciaService;
        this.mailService = mailService;
        this.estadoUsuarioService = estadoUsuarioService;
    }

    @Override
    @Transactional
    public Empresa modificarEmpresa(Long id, EmpresaRequestDTO empresaRequestDTO) {
        if(id == null){
            throw new IllegalArgumentException("El ID de la empresa no puede ser nulo");
        }
        Empresa empresaOriginal = findById(id);
        empresaMapper.updateEntityFromDto(empresaRequestDTO, empresaOriginal);
        
        if(empresaRequestDTO.getIdRubro() != null && empresaRequestDTO.getIdRubro() != empresaOriginal.getRubro().getId()){
            Rubro rubro = rubroService.findById(empresaRequestDTO.getIdRubro());
            empresaOriginal.setRubro(rubro);
        }
        
        //usuarioService.actualizarDatosUsuario(empresaOriginal.getUsuario().getId(), empresaRequestDTO.getContrasenia(), empresaRequestDTO.getRepetirContrasenia(), empresaRequestDTO.getUrlFotoPerfil(), empresaRequestDTO.getContraseniaActual());
        usuarioService.actualizarFotoPerfilUsuario(empresaOriginal.getUsuario().getId(),empresaRequestDTO.getUrlFotoPerfil());
        return empresaRepository.save(empresaOriginal);
    }

    @Override
    public List<ResultadoBusquedaEmpresaDTO> buscarEmpresasConFiltros(FiltrosEmpresaRequestDTO filtrosEmpresaRequestDTO){
        return empresaRepository.buscarEmpresasConFiltros(filtrosEmpresaRequestDTO.getIdsRubros(), filtrosEmpresaRequestDTO.getIdsProvincias(), filtrosEmpresaRequestDTO.getNombreEmpresa(), filtrosEmpresaRequestDTO.getTieneOfertasAbiertas());
    }

    @Override
    public List<ResultadoBusquedaEmpresaDTO> buscarEmpresasPorNombre(String nombreEmpresa){
        if(nombreEmpresa.isBlank() || nombreEmpresa == null){
            throw new IllegalArgumentException("El nombre de la empresa no puede estar vacío");
        }
        return empresaRepository.buscarEmpresasPorNombre(nombreEmpresa);
    }

    @Override
    @Transactional
    public Empresa crearEmpresa(EmpresaRequestDTO empresaRequestDTO){
        if(!empresaRequestDTO.getContrasenia().equals(empresaRequestDTO.getRepetirContrasenia())){
            throw new EntityNotValidException("Las contraseñas deben coincidir");
        }
        Empresa nuevaEmpresa = empresaMapper.toEntity(empresaRequestDTO);
        Rubro rubroEmpresa = rubroService.findById(empresaRequestDTO.getIdRubro());
        Provincia provinciaEmpresa = provinciaService.findById(empresaRequestDTO.getIdProvincia());
        
        UsuarioDTO usuarioDTO = new UsuarioDTO(empresaRequestDTO.getEmailEmpresa(), empresaRequestDTO.getContrasenia(), empresaRequestDTO.getUrlFotoPerfil(), CodigoEstadoUsuario.PENDIENTE, CodigoRol.ADMIN_EMPRESA);
        Usuario nuevoUsuario = usuarioService.registrarUsuario(usuarioDTO);

        nuevaEmpresa.setRubro(rubroEmpresa);
        nuevaEmpresa.setProvincia(provinciaEmpresa);
        nuevaEmpresa.setUsuario(nuevoUsuario);
        nuevaEmpresa.setFechaHoraAlta(new Date());

        empresaRepository.save(nuevaEmpresa);

        //Envio mail
        enviarMailRevisionAEmpresa(nuevaEmpresa.getUsuario().getCorreoUsuario(), nuevaEmpresa.getNombreEmpresa());

        return nuevaEmpresa;
    }

    private void enviarMailRevisionAEmpresa(String mailTo, String nombreEmpresa){
        String templateName = "mailRevisionEmpresa";
        Map<String, Object> variables = new HashMap<>();
        
        variables.put("nombreEmpresa", nombreEmpresa);

        String subject = "¡Bienvenido a Workee! Tu cuenta se encuentra en revisión.";
        mailService.enviar(mailTo, subject, templateName, variables);
    }

    @Override
    public List<EmpresaPendienteHabilitacionDTO> buscarEmpresasPendientesDeHabilitacion(String nombreEstado){
        return empresaRepository.buscarEmpresasPendientesParaHabilitar(nombreEstado);
    }

    private void enviarMailAEmpresaHabilitada(String mailTo, String nombreEmpresa){
        String templateName = "empresaHabilitada";
        Map<String, Object> variables = new HashMap<>();
        String urlInicioSesion = "http://localhost:4200/login"; //TODO: Revisar
        
        variables.put("nombreEmpresa", nombreEmpresa);
        variables.put("urlApp", urlInicioSesion);


        String subject = "¡Felicidades! Tu cuenta ha sido habilitada.";
        mailService.enviar(mailTo, subject, templateName, variables);
        System.out.println("SE NEVIO EL MAIL");
    }

    private void enviarMailAEmpresaRechazada(String mailTo, String nombreEmpresa){
        String templateName = "empresaRechazada";
        Map<String, Object> variables = new HashMap<>();
        
        variables.put("nombreEmpresa", nombreEmpresa);


        String subject = "Lo sentimos, tu cuenta ha sido rechazada";
        mailService.enviar(mailTo, subject, templateName, variables);
        System.out.println("SE NEVIO EL MAIL");
    }

    @Override
    @Transactional
    public Boolean rechazarOAceptarEmpresa(Long idEmpresa, String nuevoEstado){
        Empresa empresa = findById(idEmpresa);
        Usuario usuarioEmpresa = empresa.getUsuario();

        if(usuarioEmpresa == null){
            throw new EntityNotValidException("La empresa no posee un usuario asociado");
        }

        EstadoUsuario estadoPendiente =  estadoUsuarioService. obtenerEstadoPorCodigo(CodigoEstadoUsuario.PENDIENTE);
        EstadoUsuario estado =  estadoUsuarioService.obtenerEstadoPorCodigo(nuevoEstado);//obtenerEstadoPorNombre(nuevoEstado);


        boolean estadoCambiado = false;
        if(usuarioEmpresa.getUsuarioEstadoList() != null){
            for(UsuarioEstadoUsuario usuarioEstadoUsuario: usuarioEmpresa.getUsuarioEstadoList()){
                if(usuarioEstadoUsuario.getFechaHoraBaja() == null && usuarioEstadoUsuario.getEstadoUsuario().equals(estadoPendiente)){
                    usuarioEstadoUsuario.setFechaHoraBaja(new Date());
                    estadoCambiado = true;
                    break;
                }
            }
        }

        if(!estadoCambiado){
            throw new EntityNotValidException("No se pudo habilitar la empresa");
        }

        UsuarioEstadoUsuario nuevoUsuarioEstadoUsuario = new UsuarioEstadoUsuario();
        nuevoUsuarioEstadoUsuario.setEstadoUsuario(estado);
        nuevoUsuarioEstadoUsuario.setFechaHoraAlta(new Date());

        if (usuarioEmpresa.getUsuarioEstadoList() == null) {
            usuarioEmpresa.setUsuarioEstadoList(new java.util.ArrayList<>());
        }
        
        usuarioEmpresa.getUsuarioEstadoList().add(nuevoUsuarioEstadoUsuario);

        usuarioService.save(usuarioEmpresa);

        if(estado.getCodigoEstadoUsuario().equals(CodigoEstadoUsuario.HABILITADO)){
            enviarMailAEmpresaHabilitada(usuarioEmpresa.getCorreoUsuario(), empresa.getNombreEmpresa());
        } else if(estado.getCodigoEstadoUsuario().equals(CodigoEstadoUsuario.RECHAZADO)){
            empresa.setFechaHoraBaja(new Date());
            empresaRepository.save(empresa);
            enviarMailAEmpresaRechazada(usuarioEmpresa.getCorreoUsuario(), empresa.getNombreEmpresa());
        }

        return true;
    }


    @Override
    public Optional<Empresa> buscarEmpresaPorIdUsuario(Long idUsuario){
        if(idUsuario == null){
            throw new IllegalArgumentException("El id del usuario no puede estar vacío");
        }
        Optional<Empresa> empresa = empresaRepository.findByUsuarioId(idUsuario);

        return empresa;
    }   

    @Override
    public Boolean existeEmpresaPorUsuarioId(Long usuarioId){
        return empresaRepository.existsByUsuarioId(usuarioId);
    }

    @Override
    public Long obtenerIdEmpresaSegunCorreoUsuario(String correo){
        Optional<Long> idEmpresa = empresaRepository.buscarIdEmpresaSegunCorreo(correo);
        if(!idEmpresa.isPresent()){
            throw new EntityNotFoundException("No existe una empresa con el correo ingresado");
        }
        return idEmpresa.get();
    }
    
}


