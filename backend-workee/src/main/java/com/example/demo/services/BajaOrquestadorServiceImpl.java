package com.example.demo.services;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.dtos.ofertas.CandidatoPostuladoDTO;
import com.example.demo.entities.candidato.Candidato;
import com.example.demo.entities.empresa.EmpleadoEmpresa;
import com.example.demo.entities.empresa.Empresa;
import com.example.demo.entities.oferta.CodigoEstadoOferta;
import com.example.demo.entities.oferta.Oferta;
import com.example.demo.entities.postulaciones.PostulacionOferta;
import com.example.demo.entities.seguridad.Usuario;
import com.example.demo.exceptions.EntityAlreadyDisabledException;
import com.example.demo.services.candidato.CandidatoService;
import com.example.demo.services.empresa.EmpleadoEmpresaService;
import com.example.demo.services.empresa.EmpresaService;
import com.example.demo.services.oferta.OfertaService;
import com.example.demo.services.postulaciones.PostulacionOfertaService;
import com.example.demo.services.seguridad.UsuarioService;

import jakarta.transaction.Transactional;

@Service
public class BajaOrquestadorServiceImpl implements BajaOrquestadorService{
    private final EmpresaService empresaService;
    private final EmpleadoEmpresaService empleadoEmpresaService;
    private final UsuarioService usuarioService;
    private final CandidatoService candidatoService;
    private final PostulacionOfertaService postulacionOfertaService;
    private final OfertaService ofertaService;

    public BajaOrquestadorServiceImpl(EmpresaService empresaService, EmpleadoEmpresaService empleadoEmpresaService, UsuarioService usuarioService, 
    CandidatoService candidatoService, PostulacionOfertaService postulacionOfertaService, OfertaService ofertaService){
        this.empresaService = empresaService;
        this.empleadoEmpresaService = empleadoEmpresaService;
        this.usuarioService = usuarioService;
        this.candidatoService = candidatoService;
        this.postulacionOfertaService = postulacionOfertaService;
        this.ofertaService = ofertaService;
    }

    @Override
    @Transactional
    public void darDeBajaEmpresaYRelacionados(Long idEmpresa){
        Empresa empresa = empresaService.findById(idEmpresa);
        List<EmpleadoEmpresa> empleados = empleadoEmpresaService.visualizarTodosLosEmpleadosDeUnaEmpresa(idEmpresa);
        
        for(EmpleadoEmpresa empleado: empleados){
            empleado.setFechaHoraBaja(new Date());
            empleadoEmpresaService.save(empleado);
            usuarioService.darDeBajaUsuario(empleado.getUsuario().getId()); 
        }
        usuarioService.darDeBajaUsuario(empresa.getUsuario().getId());
        empresa.setFechaHoraBaja(new Date());
        empresaService.save(empresa);
    }

    @Override
    @Transactional
    public void darDeBajaUsuarioYEntidadRelacionada(Long idUsuario){
        Usuario usuario = usuarioService.findById(idUsuario);

        if(usuario.getFechaHoraBaja() != null){
            throw new EntityAlreadyDisabledException("El usuario ya se encuentra dado de baja");
        }

        Optional<Empresa> empresaOptional = empresaService.buscarEmpresaPorIdUsuario(idUsuario);
        if(empresaOptional.isPresent()){
            darDeBajaEmpresaYRelacionados(empresaOptional.get().getId());
            return;
        }

        Optional<EmpleadoEmpresa> empleadoEmpresaOptional = empleadoEmpresaService.buscarEmpleadoEmpresaPorUsuarioId(idUsuario);
        if(empleadoEmpresaOptional.isPresent()){
            EmpleadoEmpresa empleado = empleadoEmpresaOptional.get();
            empleado.setFechaHoraBaja(new Date());
            empleadoEmpresaService.save(empleado);
            usuarioService.darDeBajaUsuario(usuario.getId());
            return;
        }

        Optional<Candidato> candidatoOptional = candidatoService.buscarCandidatoPorIdUsuario(idUsuario);
        if(candidatoOptional.isPresent()){
            Candidato candidato = candidatoOptional.get();
            candidato.setFechaHoraBaja(new Date());
            candidatoService.save(candidato);
            usuarioService.darDeBajaUsuario(usuario.getId());
            return;
        }
    }

    @Override
    @Transactional
    public Oferta rechazarATodosYFinalizarOferta(Long idOferta){
        //Finalizar oferta
        Oferta oferta = ofertaService.cambiarEstado(idOferta, CodigoEstadoOferta.FINALIZADA);
        
        //Rechazar a todos los candidatos restantes
        List<PostulacionOferta> postulaciones = postulacionOfertaService.buscarPostulacionesCandidatosEnCurso(idOferta);
        
        String retroalimentacion = "La empresa ha decidido finalizar la oferta. Lamentablemente no has sido seleccionado.";
        postulacionOfertaService.rechazarListado(postulaciones, retroalimentacion);
        
        //Si no hay ningún postulado marca el finalizada con exito como false
        List<CandidatoPostuladoDTO> postulacionesSeleccionadas = postulacionOfertaService.traerCandidatosSeleccionados(idOferta);
        
        if(!postulacionesSeleccionadas.isEmpty()){
            ofertaService.marcarResultadoFinal(idOferta, true);
        }else {
            ofertaService.marcarResultadoFinal(idOferta, false);
        }

        return oferta;
    }
}
