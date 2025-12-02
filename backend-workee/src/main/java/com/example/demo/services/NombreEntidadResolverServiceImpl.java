package com.example.demo.services;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.demo.entities.candidato.Candidato;
import com.example.demo.entities.empresa.EmpleadoEmpresa;
import com.example.demo.entities.empresa.Empresa;
import com.example.demo.repositories.candidato.CandidatoRepository;
import com.example.demo.repositories.empresa.EmpleadoEmpresaRepository;
import com.example.demo.repositories.empresa.EmpresaRepository;

@Service
public class NombreEntidadResolverServiceImpl implements NombreEntidadResolverService {
    public final CandidatoRepository candidatoRepository;
    public final EmpresaRepository empresaRepository;
    public final EmpleadoEmpresaRepository empleadoEmpresaRepository;

    public NombreEntidadResolverServiceImpl(CandidatoRepository candidatoRepository, EmpresaRepository empresaRepository, EmpleadoEmpresaRepository empleadoEmpresaRepository){
        this.candidatoRepository = candidatoRepository;
        this.empleadoEmpresaRepository = empleadoEmpresaRepository;
        this.empresaRepository = empresaRepository;
    }

    @Override
    public String obtenerNombreEntidadPorIdUsuario(Long idUsuario) {
        String nombreEntidad = "";
        Optional<Candidato> candidatoOptional = candidatoRepository.findByUsuarioId(idUsuario);
        if(candidatoOptional.isPresent()){
            Candidato candidato = candidatoOptional.get();
            nombreEntidad = candidato.getNombreCandidato() + " " + candidato.getApellidoCandidato();
            return nombreEntidad;

        }

        Optional<EmpleadoEmpresa> empleadoEmpresaOptional = empleadoEmpresaRepository.findByUsuarioId(idUsuario);
        if(empleadoEmpresaOptional.isPresent()){
            EmpleadoEmpresa empleadoEmpresa = empleadoEmpresaOptional.get();
            nombreEntidad = empleadoEmpresa.getNombreEmpleadoEmpresa() + " " + empleadoEmpresa.getApellidoEmpleadoEmpresa() + " - " + empleadoEmpresa.getEmpresa().getNombreEmpresa();
            return nombreEntidad;

        }

        Optional<Empresa> empresaOptional = empresaRepository.findByUsuarioId(idUsuario);
        if(empresaOptional.isPresent()){
            Empresa empresa = empresaOptional.get();
            nombreEntidad = empresa.getNombreEmpresa();
            return nombreEntidad;
        }

        return nombreEntidad;
    }
}
