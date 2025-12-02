package com.example.demo.services.empresa;

import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.dtos.empresa.EmpleadoEmpresaRequestDTO;
import com.example.demo.dtos.seguridad.UsuarioDTO;
import com.example.demo.entities.empresa.EmpleadoEmpresa;
import com.example.demo.entities.empresa.Empresa;
import com.example.demo.entities.oferta.CodigoEstadoOferta;
import com.example.demo.entities.params.CodigoEstadoUsuario;
import com.example.demo.entities.seguridad.CodigoRol;
import com.example.demo.entities.seguridad.Usuario;
import com.example.demo.exceptions.EntityNotValidException;
import com.example.demo.mappers.EmpleadoEmpresaMapper;
import com.example.demo.repositories.empresa.EmpleadoEmpresaRepository;
import com.example.demo.repositories.oferta.OfertaRepository;
import com.example.demo.services.BaseServiceImpl;
import com.example.demo.services.seguridad.UsuarioService;

import jakarta.transaction.Transactional;

@Service
public class EmpleadoEmpresaServiceImpl extends BaseServiceImpl<EmpleadoEmpresa, Long> implements EmpleadoEmpresaService{
  
    private final EmpleadoEmpresaRepository empleadoEmpresaRepository;
    private final EmpresaService empresaService;
    private final EmpleadoEmpresaMapper empleadoEmpresaMapper;
    private final OfertaRepository ofertaRepository;

    private final UsuarioService usuarioService; 

    public EmpleadoEmpresaServiceImpl(EmpleadoEmpresaRepository empleadoEmpresaRepository, EmpresaService empresaService, EmpleadoEmpresaMapper empleadoEmpresaMapper, UsuarioService usuarioService, OfertaRepository ofertaRepository) {
        super(empleadoEmpresaRepository);
        this.empleadoEmpresaRepository = empleadoEmpresaRepository;
        this.empresaService = empresaService;
        this.empleadoEmpresaMapper = empleadoEmpresaMapper;
        this.usuarioService = usuarioService;
        this.ofertaRepository = ofertaRepository;
    }
    
    @Override
    @Transactional
    public EmpleadoEmpresa darDeAltaEmpleado(EmpleadoEmpresaRequestDTO empleadoEmpresaRequestDTO){
        System.out.println("El id de la empresa es " + empleadoEmpresaRequestDTO.getIdEmpresa());
        if(empleadoEmpresaRequestDTO.getIdEmpresa() == null){
            throw new IllegalArgumentException("El id de la empresa no puede estar vacío");
        }
        if(!empleadoEmpresaRequestDTO.getRepetirContrasenia().equals(empleadoEmpresaRequestDTO.getContrasenia()) ){
            throw new EntityNotValidException("Las contraseñas deben coincidir");
        }

        UsuarioDTO dtoUsuario = new UsuarioDTO(empleadoEmpresaRequestDTO.getCorreoEmpleadoEmpresa(), empleadoEmpresaRequestDTO.getContrasenia(), empleadoEmpresaRequestDTO.getUrlFotoPerfil(), CodigoEstadoUsuario.HABILITADO, CodigoRol.EMPLEADO_EMPRESA);
        Usuario usuarioCreado = usuarioService.registrarUsuario(dtoUsuario);

        Empresa empresa = empresaService.findById(empleadoEmpresaRequestDTO.getIdEmpresa());
        EmpleadoEmpresa nuevoEmpleado = new EmpleadoEmpresa();

        nuevoEmpleado = empleadoEmpresaMapper.toEntity(empleadoEmpresaRequestDTO);
        nuevoEmpleado.setEmpresa(empresa);
        nuevoEmpleado.setFechaHoraAlta(new Date());
        nuevoEmpleado.setUsuario(usuarioCreado);

        empleadoEmpresaRepository.save(nuevoEmpleado);

        return nuevoEmpleado;
    }
   

    @Override
    @Transactional
    public EmpleadoEmpresa modificarEmpleado(EmpleadoEmpresaRequestDTO empleadoEmpresaRequestDTO, boolean esEmpleadoModificandoseASiMismo, Long id){
        EmpleadoEmpresa empleadoOriginal = findById(id);

        if(esEmpleadoModificandoseASiMismo){
            modificarComoEmpleado(empleadoOriginal, empleadoEmpresaRequestDTO);
        } else {
            modificarComoAdministrador(empleadoOriginal, empleadoEmpresaRequestDTO);
        }

        return empleadoEmpresaRepository.save(empleadoOriginal);
    }

    private void modificarComoEmpleado(EmpleadoEmpresa empleadoEmpresa, EmpleadoEmpresaRequestDTO empleadoEmpresaRequestDTO){
        empleadoEmpresaMapper.updateEntityFromDto(empleadoEmpresaRequestDTO, empleadoEmpresa);
        
        //modificar datos de usuario
        usuarioService.actualizarFotoPerfilUsuario(empleadoEmpresa.getUsuario().getId(), empleadoEmpresaRequestDTO.getUrlFotoPerfil());
    }

    private void modificarComoAdministrador(EmpleadoEmpresa empleadoEmpresa, EmpleadoEmpresaRequestDTO empleadoEmpresaRequestDTO){
        if(empleadoEmpresaRequestDTO.getPuestoEmpleadoEmpresa() != null && !empleadoEmpresaRequestDTO.getPuestoEmpleadoEmpresa().isEmpty()){
            empleadoEmpresa.setPuestoEmpleadoEmpresa(empleadoEmpresaRequestDTO.getPuestoEmpleadoEmpresa());
        } else {
            throw new EntityNotValidException("El puesto no puede ser nulo");
        }
    }

    @Override
    @Transactional
    public Boolean darDeBajaEmpleadoEmpresa(Long id){
        if (id == null) throw new IllegalArgumentException("El ID del empleado no puede ser nulo");

        List<String> noFinalizadas = List.of(CodigoEstadoOferta.ABIERTA, CodigoEstadoOferta.CERRADA);

        boolean tieneNoFinalizadas = ofertaRepository.existsNoFinalizadaByEmpleado(id, noFinalizadas);
        if (tieneNoFinalizadas) {
            throw new IllegalStateException("No se puede dar de baja: el empleado participa en ofertas no finalizadas.");
        }
        EmpleadoEmpresa empleadoEmpresa = findById(id);
        usuarioService.delete(empleadoEmpresa.getUsuario().getId());
        return delete(id);
    }

    @Override
    @Transactional
    public Boolean habilitarEmpleadoEmpresa(Long id){
        EmpleadoEmpresa empleadoEmpresa = findById(id);

        if(empleadoEmpresa.getFechaHoraBaja() == null){
            throw new EntityNotValidException("El empleado ya se encuentra habilitado");
        }
        empleadoEmpresa.setFechaHoraBaja(null);

        usuarioService.habilitarUsuario(empleadoEmpresa.getUsuario().getId());
        
        empleadoEmpresaRepository.save(empleadoEmpresa);
        
        return true;
    }

    @Override
    public List<EmpleadoEmpresa> visualizarEmpleados(Long idEmpresa){
        return empleadoEmpresaRepository.traerEmpleadosActivos(idEmpresa);
    }

    @Override
    public Long contarEmpleadosDeEmpresa(Long idempresa){
        return empleadoEmpresaRepository.contarEmpelados(idempresa);
    }

    @Override
    @Transactional
    public List<EmpleadoEmpresa> findAllById(Collection<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new IllegalArgumentException("La colección de IDs no puede ser nula o vacía");
        }
        return empleadoEmpresaRepository.findAllByIdIn(ids);
    }

    @Override
    public Optional<EmpleadoEmpresa> buscarEmpleadoEmpresaPorUsuarioId(Long idUsuario){
        if(idUsuario == null){
            throw new IllegalArgumentException("El id del usuario no puede estar vacío");
        }
        Optional<EmpleadoEmpresa> empleado = empleadoEmpresaRepository.findByUsuarioId(idUsuario);
        return empleado;
    }

    @Override
    public List<EmpleadoEmpresa> visualizarTodosLosEmpleadosDeUnaEmpresa(Long idEmpresa){
        return empleadoEmpresaRepository.traerTodosLosEmpleadosDeUnaEmpresa(idEmpresa);
    }

    @Override
    public Boolean existeEmpleadoPorUsuarioId(Long usuarioId){
        return empleadoEmpresaRepository.existsByUsuarioId(usuarioId);
    }

    @Override
    public Optional<EmpleadoEmpresa> buscarEmpleadoPorIdUsuario(Long idUsuario){
        if(idUsuario == null){
            throw new IllegalArgumentException("El id del usuario no puede estar vacío");
        }
        Optional<EmpleadoEmpresa> empleado = empleadoEmpresaRepository.findByUsuarioId(idUsuario);

        return empleado;
    }   
}