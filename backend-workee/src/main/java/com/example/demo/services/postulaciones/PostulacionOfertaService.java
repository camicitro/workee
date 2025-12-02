package com.example.demo.services.postulaciones;

import java.util.List;
import java.util.Optional;

import com.example.demo.dtos.ofertas.CandidatoPostuladoDTO;
import com.example.demo.dtos.postulaciones.CambioPostulacionDTO;
import com.example.demo.dtos.postulaciones.EtapaActualPostulacionDTO;
import com.example.demo.dtos.postulaciones.PostulacionCandidatoRequestDTO;
import com.example.demo.dtos.postulaciones.PostulacionSimplificadaDTO;
import com.example.demo.dtos.postulaciones.RetroalimentacionDTO;
import com.example.demo.dtos.postulaciones.SeleccionadoDTO;
import com.example.demo.entities.postulaciones.PostulacionOferta;
import com.example.demo.entities.postulaciones.PostulacionOfertaEtapa;
import com.example.demo.services.BaseService;

public interface PostulacionOfertaService extends BaseService<PostulacionOferta, Long>{
    public PostulacionSimplificadaDTO postularComoCandidato(PostulacionCandidatoRequestDTO postulacionCandidatoRequestDTO);

    public List<PostulacionSimplificadaDTO> obtenerPostulacionesDeUnCandidato(Long idCandidato);

    public PostulacionSimplificadaDTO abandonarPostulacionComoCandidato(Long idPostulacion);

    public PostulacionSimplificadaDTO actualizarPostulacionDeCandidato(Long idPostulacion, CambioPostulacionDTO cambioPostulacionDTO);

    public List<EtapaActualPostulacionDTO> buscarEtapasActualesDePostulacionesDeCandidato(Long idCandidato);

    public PostulacionSimplificadaDTO verDetallePostulacionDeCandidato(Long idPostulacion);

    public List<CandidatoPostuladoDTO> traerCandidatosPostuladosAOferta(Long idOferta);

    public List<CandidatoPostuladoDTO> traerCandidatosPendientesPostuladosAOferta(Long idOferta);

    public List<CandidatoPostuladoDTO> traerCandidatosEnviadaPostulacionAOferta(Long idOferta);

    public Boolean aceptarSolicitudDePostulacionCandidato(Long idPostulacion);

    public Boolean rechazarSolicitudDePostulacionDeCandidatoPendiente(Long idPostulacion);

    public List<PostulacionOferta> buscarPostulacionesCandidatosEnCurso(Long idOferta);

    public List<CandidatoPostuladoDTO> traerCandidatosSeleccionados(Long idOferta);

    public Boolean seleccionarCandidato(Long idPostulacion, SeleccionadoDTO seleccionadoDTO);

    public Boolean rechazarListado(List<PostulacionOferta> postulaciones, String retroalimentacion);

    public PostulacionSimplificadaDTO enviarRetroalimentacion(RetroalimentacionDTO retroalimentacionDTO);

    public PostulacionSimplificadaDTO enviarRespuestaCandidato(RetroalimentacionDTO retroalimentacionDTO);

    public PostulacionSimplificadaDTO enviarPostulacionACandidato(PostulacionCandidatoRequestDTO postulacionCandidatoRequestDTO);

    public EtapaActualPostulacionDTO verEtapaActualDeUnaPostulacion(Long idCandidato, Long idOferta);

    public Boolean rechazarSolicitudDePostulacionDeEmpresa(Long idPostulacion);

    List<PostulacionOfertaEtapa> obtenerEtapasDePostulacion(Long idPostulacion);

    Optional<PostulacionOferta> obtenerPorEtapaId(Long idEtapa);

    public Long getIdPostulacionOfertaPorIdNotificacion(Long idNotificacion);

    public Long getIdPostulacionOfertaPorIdNotificacion2(Long idNotificacion);

}

