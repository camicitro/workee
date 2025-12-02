package com.example.demo.services.candidato;

import java.util.List;
import java.util.Optional;

import com.example.demo.dtos.busquedas.FiltrosCandidatoRequestDTO;
import com.example.demo.dtos.candidato.CandidatoRequestDTO;
import com.example.demo.entities.candidato.Candidato;
import com.example.demo.entities.params.Habilidad;
import com.example.demo.services.BaseService;

public interface CandidatoService extends BaseService<Candidato, Long> {
    
    Candidato crearCandidato(CandidatoRequestDTO candidatoDTO);
    
    Candidato modificarCandidato(Long idCandidato, CandidatoRequestDTO candidatoRequestDTO);
    
    List<Candidato> obtenerCandidatos();

    List<Habilidad> obtenerHabilidades(Long idCandidato);

    List<Habilidad> obtenerHabilidadesPorTipo(Long idCandidato, Long idTipoHabilidad);
    
    void actualizaroCrearCV(Long idCandidato, String cv);
    
    void eliminarCv(Long idCandidato);

    public List<Candidato> buscarCandidatosConFiltros(FiltrosCandidatoRequestDTO filtrosCandidatoRequestDTO);
    public List<Candidato> buscarCandidatosPorNombre(String nombreCandidato);

    public Optional<Candidato> buscarCandidatoPorIdUsuario(Long idUsuario);

    public Candidato traerPerfilCandidatoPorUsuario(Long idUsuario);

    public Boolean eliminarCuentaCandidato(Long idCandidato);
    
    public Boolean existeCandidatoPorUsuarioId(Long usuarioId);
}
