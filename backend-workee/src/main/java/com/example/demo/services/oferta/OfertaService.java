package com.example.demo.services.oferta;

import java.util.List;

import com.example.demo.dtos.busquedas.FiltrosOfertaRequestDTO;
import com.example.demo.dtos.ofertas.OfertaRequestDTO;
import com.example.demo.dtos.params.OfertasEmpleadoDTO;
import com.example.demo.dtos.postulaciones.OfertasEtapasDTO;
import com.example.demo.entities.oferta.Oferta;
import com.example.demo.entities.params.Etapa;
import com.example.demo.services.BaseService;

public interface OfertaService extends BaseService<Oferta, Long>{
    Oferta crearOferta(OfertaRequestDTO ofertaDTO);    

    Oferta cambiarEstado(Long ofertaId, String nuevoCodigo);

    Oferta marcarResultadoFinal(Long ofertaId, boolean conExito);

    List<Oferta> findAllByEmpresaId(Long empresaId);

    public List<Oferta> buscarOfertasSegunFiltros(FiltrosOfertaRequestDTO filtrosOfertaRequestDTO);
    
    public List<Oferta> buscarOfertasPorNombre(String nombreOferta);

    List<OfertasEmpleadoDTO> buscarOfertasEmpleado(Long empleadoId);

    public List<OfertasEtapasDTO> buscarProximasEtapasEnOferta(Long idOferta, Integer nroEtapa);

    public List<Oferta> buscarOfertasAbiertas(Long idEmpresa);
    public List<Oferta> buscarOfertasAbiertasParaEnviar(Long idEmpresa, Long idCandidato);

    public Integer obtenerCantidadDePostulados(Long idOferta);

    public List<Etapa> obtenerEtapasDeOferta(Long idOferta);

}
