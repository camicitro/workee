package com.example.demo.services.empresa;

import java.util.List;
import java.util.Optional;

import com.example.demo.dtos.busquedas.FiltrosEmpresaRequestDTO;
import com.example.demo.dtos.busquedas.ResultadoBusquedaEmpresaDTO;
import com.example.demo.dtos.empresa.EmpresaRequestDTO;
import com.example.demo.dtos.seguridad.EmpresaPendienteHabilitacionDTO;
import com.example.demo.entities.empresa.Empresa;
import com.example.demo.services.BaseService;

public interface EmpresaService extends BaseService<Empresa, Long>{
   public Empresa modificarEmpresa(Long id, EmpresaRequestDTO empresaRequestDTO);


   public List<ResultadoBusquedaEmpresaDTO> buscarEmpresasConFiltros(FiltrosEmpresaRequestDTO filtrosEmpresaRequestDTO);

   public List<ResultadoBusquedaEmpresaDTO> buscarEmpresasPorNombre(String nombreEmpresa);
   
   //public List<Empresa> buscarEmpresasPorNombreEmpresa(String nombreEmpresa);

   public Empresa crearEmpresa(EmpresaRequestDTO empresaRequestDTO);

   public List<EmpresaPendienteHabilitacionDTO> buscarEmpresasPendientesDeHabilitacion(String nombreEstado);

   public Boolean rechazarOAceptarEmpresa(Long idEmpresa, String nuevoEstado);

   public Optional<Empresa> buscarEmpresaPorIdUsuario(Long idUsuario);

   public Boolean existeEmpresaPorUsuarioId(Long usuarioId);

   public Long obtenerIdEmpresaSegunCorreoUsuario(String correo);
}




 
