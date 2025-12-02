package com.example.demo.services.empresa;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import com.example.demo.dtos.empresa.EmpleadoEmpresaRequestDTO;
import com.example.demo.entities.empresa.EmpleadoEmpresa;
import com.example.demo.services.BaseService;

public interface EmpleadoEmpresaService extends BaseService<EmpleadoEmpresa, Long>{
    public EmpleadoEmpresa darDeAltaEmpleado(EmpleadoEmpresaRequestDTO empleadoEmpresaRequestDTO);

    public EmpleadoEmpresa modificarEmpleado(EmpleadoEmpresaRequestDTO empleadoEmpresaRequestDTO, boolean esEmpleadoModificandoseASiMismo, Long id);

    public Boolean darDeBajaEmpleadoEmpresa(Long id);
    public Boolean habilitarEmpleadoEmpresa(Long id);

    public List<EmpleadoEmpresa> visualizarEmpleados(Long idEmpresa);

    public Long contarEmpleadosDeEmpresa(Long idempresa);

    public List<EmpleadoEmpresa> findAllById(Collection<Long> ids);


    public Optional<EmpleadoEmpresa> buscarEmpleadoEmpresaPorUsuarioId(Long idUsuario);

    public List<EmpleadoEmpresa> visualizarTodosLosEmpleadosDeUnaEmpresa(Long idEmpresa);

    public Boolean existeEmpleadoPorUsuarioId(Long usuarioId);

    public Optional<EmpleadoEmpresa> buscarEmpleadoPorIdUsuario(Long idUsuario);
}
