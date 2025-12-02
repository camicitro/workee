package com.example.demo.services.metricas;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.apache.commons.lang3.tuple.Pair;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.example.demo.dtos.metricas.admin.DistribucionUsuariosPorRolResponseDTO;
import com.example.demo.dtos.metricas.admin.EmpresasConMasOfertasDTO;
import com.example.demo.dtos.metricas.admin.EstadisticasAdminDTO;
import com.example.demo.dtos.metricas.admin.EvolucionUsuariosDTO;
import com.example.demo.dtos.metricas.admin.UsuariosPorPaisDTO;
import com.example.demo.dtos.metricas.admin.UsuariosPorRolDTO;
import com.example.demo.dtos.metricas.candidato.DistribucionPostulacionesPorPaisDTO;
import com.example.demo.dtos.metricas.candidato.EstadisticasCandidatoDTO;
import com.example.demo.dtos.metricas.candidato.PostulacionesPorPaisDTO;
import com.example.demo.dtos.metricas.candidato.RubrosDeInteresDTO;
import com.example.demo.dtos.metricas.candidato.TopHabilidadDTO;
import com.example.demo.dtos.metricas.empresa.DistribucionGenerosDTO;
import com.example.demo.dtos.metricas.empresa.EstadisticasEmpresaDTO;
import com.example.demo.dtos.metricas.empresa.GenerosPostuladosDTO;
import com.example.demo.repositories.oferta.OfertaRepository;
import com.example.demo.repositories.postulaciones.PostulacionOfertaRepository;
import com.example.demo.repositories.seguridad.UsuarioRepository;
import com.example.demo.repositories.seguridad.UsuarioRolRepository;

@Service
public class MetricasServiceImpl implements MetricasService{
    private final UsuarioRepository usuarioRepository;
    private final OfertaRepository ofertaRepository;
    private final UsuarioRolRepository usuarioRolRepository;
    private final PostulacionOfertaRepository postulacionOfertaRepository;

    public MetricasServiceImpl(UsuarioRepository usuarioRepository, OfertaRepository ofertaRepository, 
    UsuarioRolRepository usuarioRolRepository, PostulacionOfertaRepository postulacionOfertaRepository){
        this.usuarioRepository = usuarioRepository;
        this.ofertaRepository = ofertaRepository;
        this.usuarioRolRepository = usuarioRolRepository;
        this.postulacionOfertaRepository = postulacionOfertaRepository;
    }
    //ADMINITRADOR DEL SISTEMA
    @Override
    public EstadisticasAdminDTO verEstadisticasAdminSistema(LocalDateTime fechaDesde, LocalDateTime fechaHasta){
        EstadisticasAdminDTO estadisticas = new EstadisticasAdminDTO();
        
        //Cantidad historica usuarios
        Integer cantidadUsuarios = this.cantidadTotalHistoricaUsuarios();
        estadisticas.setCantidadHistoricaUsuarios(cantidadUsuarios);

        //Tasa de exito de ofertas
        Double tasaExito = this.tasaExitoOfertas(fechaDesde, fechaHasta);
        estadisticas.setTasaExitoOfertas(tasaExito);

        //Distribucion de usuarios por rol
        DistribucionUsuariosPorRolResponseDTO distribucionUsuarios = this.distribucionUsuariosPorRol(fechaDesde, fechaHasta);
        estadisticas.setDistribucionUsuariosPorRol(distribucionUsuarios);

        //Cantidad de usuarios por pais (top 5)
        List<UsuariosPorPaisDTO> cantidadUsuariosPorPais = this.cantidadUsuariosPorPaisTop5(fechaDesde, fechaHasta);
        estadisticas.setCantidadUsuariosPorPais(cantidadUsuariosPorPais);

        //Empresas con más ofertas
        List<EmpresasConMasOfertasDTO> topEmpresasConMasOfertas = this.topEmpresasConMasOfertas(fechaDesde, fechaHasta);
        estadisticas.setEmpresasConMasOfertas(topEmpresasConMasOfertas);

        //Evolucion de registro de usuarios
        List<EvolucionUsuariosDTO> evolucionUsuariosRegistrados = this.evolucionUsuariosRegistrados(fechaDesde, fechaHasta);
        estadisticas.setEvolucionUsuariosRegistrados(evolucionUsuariosRegistrados);
        
        return estadisticas;
    }


    private Integer cantidadTotalHistoricaUsuarios(){
        return usuarioRepository.cantidadHistoricaUsuariosActivos();
    }

    private Double tasaExitoOfertas(LocalDateTime fechaDesde, LocalDateTime fechaHasta){
        Pair<LocalDateTime, LocalDateTime> fechas = manejoFechasParaFiltros(fechaDesde, fechaHasta);

        Long cantidadTotalFinalizadas = ofertaRepository.contarOfertasFinalizadas(fechas.getLeft(), fechas.getRight());
        if(cantidadTotalFinalizadas == 0){
            return 0.0;
        }
        Long cantidadTotalFinalizadasConExito = ofertaRepository.contarOfertasFinalizadasConExito(fechas.getLeft(), fechas.getRight());

        Double tasaExito = (cantidadTotalFinalizadasConExito * 100.0) / cantidadTotalFinalizadas;

        return tasaExito;
    }

    private DistribucionUsuariosPorRolResponseDTO distribucionUsuariosPorRol(LocalDateTime fechaDesde, LocalDateTime fechaHasta){
        Pair<LocalDateTime, LocalDateTime> fechas = manejoFechasParaFiltros(fechaDesde, fechaHasta);

        List<UsuariosPorRolDTO> usuariosPorRol = usuarioRolRepository.obtenerDistribucionUsuariosPorRol(fechas.getLeft(), fechas.getRight());
        
        Long total = usuariosPorRol.stream().mapToLong(usuario -> usuario.getCantidadUsuarios()).sum();

        for(UsuariosPorRolDTO usuario: usuariosPorRol){
            Double porcentaje = (usuario.getCantidadUsuarios() * 100.0) / total;
            usuario.setPorcentajeUsuarios(porcentaje);
        }
        DistribucionUsuariosPorRolResponseDTO distribucion = new DistribucionUsuariosPorRolResponseDTO();
        distribucion.setCantidadTotalUsuarios(total);
        distribucion.setDistribucion(usuariosPorRol);

        return distribucion;

    }

    private List<UsuariosPorPaisDTO> cantidadUsuariosPorPaisTop5(LocalDateTime fechaDesde, LocalDateTime fechaHasta){
        Pair<LocalDateTime, LocalDateTime> fechas = manejoFechasParaFiltros(fechaDesde, fechaHasta);
        
        List<Object[]> listado = usuarioRepository.contarUsuariosPorPaisTop5(fechas.getLeft(), fechas.getRight());
        List<UsuariosPorPaisDTO> usuariosPorPais = listado.stream()
                                                        .map(obj -> new UsuariosPorPaisDTO(
                                                                (String) obj[0],              
                                                                ((Number) obj[1]).longValue() 
                                                        ))
                                                        .collect(Collectors.toList());
        return usuariosPorPais;
    }

    private List<EmpresasConMasOfertasDTO> topEmpresasConMasOfertas(LocalDateTime fechaDesde, LocalDateTime fechaHasta){
        Pair<LocalDateTime, LocalDateTime> fechas = manejoFechasParaFiltros(fechaDesde, fechaHasta);

        List<EmpresasConMasOfertasDTO> empresas = ofertaRepository.topEmpresasConMasOfertas(fechas.getLeft(), fechas.getRight(), PageRequest.of(0, 5)); // primera pag, 5 elementos
        empresas.sort(Comparator.comparingLong(EmpresasConMasOfertasDTO::getCantidadOfertas));

        return empresas;
    }

    private List<EvolucionUsuariosDTO> evolucionUsuariosRegistrados(LocalDateTime fechaDesde, LocalDateTime fechaHasta){
        Pair<LocalDateTime, LocalDateTime> fechas = manejoFechasParaFiltros(fechaDesde, fechaHasta);

        List<Object[]> elementos = usuarioRepository.evolucionUsuarios(fechas.getLeft(), fechas.getRight());

        return elementos.stream()
               .map(obj -> new EvolucionUsuariosDTO(
                       ((java.sql.Date) obj[0]).toLocalDate(),
                       ((Number) obj[1]).longValue()
               ))
               .collect(Collectors.toList());
    }
    
    
    //CANDIDATO
    @Override
    public EstadisticasCandidatoDTO verEstadisticasCandidato(Long idCandidato, LocalDateTime fechaDesde, LocalDateTime fechaHasta){
        EstadisticasCandidatoDTO estadisticas = new EstadisticasCandidatoDTO();

        Long postulacionesEnCurso = this.contarPostulacionesEnCurso(idCandidato);
        estadisticas.setCantidadPostulacionesEnCurso(postulacionesEnCurso);

        Long postulacionesRechazadas = this.contarPostulacionesRechazadas(idCandidato, fechaDesde, fechaHasta);
        estadisticas.setCantidadPostulacionesRechazadas(postulacionesRechazadas);

        List<RubrosDeInteresDTO> rubrosDeInteres = this.verRubrosDeInteres(idCandidato, fechaDesde, fechaHasta);
        estadisticas.setRubrosDeInteres(rubrosDeInteres);

        DistribucionPostulacionesPorPaisDTO paisesMasPostulados = this.verPaisesMasPostulados(idCandidato, fechaDesde, fechaHasta);
        estadisticas.setPaisesMasPostulados(paisesMasPostulados);

        List<TopHabilidadDTO> topHabilidadesBlandas = this.topHabilidadesBlandas(fechaDesde, fechaHasta);
        estadisticas.setTopHabilidadesBlandas(topHabilidadesBlandas);

        List<TopHabilidadDTO> topHabilidadesTecnicas = this.topHabilidadesTecnicas(fechaDesde, fechaHasta);
        estadisticas.setTopHabilidadesTecnicas(topHabilidadesTecnicas);

        return estadisticas;
    }

    private Long contarPostulacionesEnCurso(Long idCandidato){
        return postulacionOfertaRepository.traerCantidadPostulacionesEnCurso(idCandidato); 
    }

    private Long contarPostulacionesRechazadas(Long idCandidato, LocalDateTime fechaDesde, LocalDateTime fechaHasta){
        Pair<LocalDateTime, LocalDateTime> fechas = manejoFechasParaFiltros(fechaDesde, fechaHasta);

        return postulacionOfertaRepository.traerCantidadPostulacionesRechazadas(idCandidato, fechas.getLeft(), fechas.getRight()); 
    }

    private List<RubrosDeInteresDTO> verRubrosDeInteres(Long idCandidato, LocalDateTime fechaDesde, LocalDateTime fechaHasta){
        Pair<LocalDateTime, LocalDateTime> fechas = manejoFechasParaFiltros(fechaDesde, fechaHasta);
        
        return postulacionOfertaRepository.traerRubrosDeInteres(idCandidato, fechas.getLeft(), fechas.getRight());
    }

    private DistribucionPostulacionesPorPaisDTO verPaisesMasPostulados(Long idCandidato, LocalDateTime fechaDesde, LocalDateTime fechaHasta){
        Pair<LocalDateTime, LocalDateTime> fechas = manejoFechasParaFiltros(fechaDesde, fechaHasta);

        List<PostulacionesPorPaisDTO> postulaciones = postulacionOfertaRepository.postulacionesPorPais(idCandidato, fechas.getLeft(), fechas.getRight());

        Long total = postulaciones.stream().mapToLong(usuario -> usuario.getCantidad()).sum();

        for(PostulacionesPorPaisDTO postulacion: postulaciones){
            Double porcentaje = (postulacion.getCantidad() * 100.0) / total;
            postulacion.setPorcentajePostulaciones(porcentaje);
        }
        DistribucionPostulacionesPorPaisDTO distribucion = new DistribucionPostulacionesPorPaisDTO();
        distribucion.setTotalPostulaciones(total);
        distribucion.setPostulaciones(postulaciones);

        return distribucion;
    }

    private List<TopHabilidadDTO> topHabilidadesBlandas(LocalDateTime fechaDesde, LocalDateTime fechaHasta){
        Pair<LocalDateTime, LocalDateTime> fechas = manejoFechasParaFiltros(fechaDesde, fechaHasta);
        
        return ofertaRepository.topHabilidades(fechas.getLeft(), fechas.getRight(),"HABILIDAD_BLANDA", PageRequest.of(0, 3));
    }

    private List<TopHabilidadDTO> topHabilidadesTecnicas(LocalDateTime fechaDesde, LocalDateTime fechaHasta){
        Pair<LocalDateTime, LocalDateTime> fechas = manejoFechasParaFiltros(fechaDesde, fechaHasta);
        
        return ofertaRepository.topHabilidades(fechas.getLeft(), fechas.getRight(),"HABILIDAD_TECNICA", PageRequest.of(0, 3));
    }


    //EMPRESA
    @Override
    public EstadisticasEmpresaDTO verEstadisticasEmpresa(Long idEmpresa, LocalDateTime fechaDesde, LocalDateTime fechaHasta){
        EstadisticasEmpresaDTO estadisticas = new EstadisticasEmpresaDTO();

        Long cantidadOfertasAbiertas = this.obtenerCantidadOfertasAbiertas(idEmpresa);
        estadisticas.setCantidadOfertasAbiertas(cantidadOfertasAbiertas);

        DistribucionGenerosDTO distribucionGeneros = this.distribucionGenerosEnOfertas(idEmpresa, fechaDesde, fechaHasta);
        estadisticas.setDistribucionGeneros(distribucionGeneros);

        Double tasaAbandono = this.tasaAbandonoOfertas(idEmpresa, fechaDesde, fechaHasta);
        estadisticas.setTasaAbandono(tasaAbandono);

        Double tiempoPromedioContratacion = this.tiempoPromedioContratacion(idEmpresa, fechaDesde, fechaHasta);
        estadisticas.setTiempoPromedioContratacion(tiempoPromedioContratacion);

        DistribucionPostulacionesPorPaisDTO distribucionPostulacionesPorPais = this.localizacionCandidatos(idEmpresa, fechaDesde, fechaHasta);
        estadisticas.setDistribucionPostulacionesPorPais(distribucionPostulacionesPorPais);

        return estadisticas;
    }
    
    private Long obtenerCantidadOfertasAbiertas(Long idEmpresa){
        return ofertaRepository.contarOfertasAbiertas(idEmpresa);
    }

    private DistribucionGenerosDTO distribucionGenerosEnOfertas(Long idEmpresa, LocalDateTime fechaDesde, LocalDateTime fechaHasta){
        Pair<LocalDateTime, LocalDateTime> fechas = manejoFechasParaFiltros(fechaDesde, fechaHasta);

        List<GenerosPostuladosDTO> generos = postulacionOfertaRepository.distribucionGenerosPorEmpresa(idEmpresa, fechas.getLeft(), fechas.getRight());

        Long total = generos.stream().mapToLong(genero -> genero.getCantidadCandidatosPostulados()).sum();
        for(GenerosPostuladosDTO postulacion: generos){
            Double porcentaje = (postulacion.getCantidadCandidatosPostulados() * 100.0) / total;
            postulacion.setPorcentajePostulaciones(porcentaje);
        }
        DistribucionGenerosDTO distribucion = new DistribucionGenerosDTO();
        distribucion.setPostulaciones(generos);
        distribucion.setTotalPostulaciones(total);

        return distribucion;
    }
    
    private Double tasaAbandonoOfertas(Long idEmpresa, LocalDateTime fechaDesde, LocalDateTime fechaHasta){
        Pair<LocalDateTime, LocalDateTime> fechas = manejoFechasParaFiltros(fechaDesde, fechaHasta);

        List<Object[]> resultados = postulacionOfertaRepository.abandonoVsTotal(idEmpresa, fechas.getLeft(), fechas.getRight());
        if (resultados.isEmpty()) {
            return 0.0; 
        }

        Object[] resultado = resultados.get(0); 

        Long abandonadas = ((Number) resultado[0]).longValue();
        Long total = ((Number) resultado[1]).longValue();

        if (total == 0) {
            return 0.0; 
        }
        return (abandonadas.doubleValue() / total.doubleValue()) * 100.0;
    }

    private Double tiempoPromedioContratacion(Long idEmpresa, LocalDateTime fechaDesde, LocalDateTime fechaHasta){
        Pair<LocalDateTime, LocalDateTime> fechas = manejoFechasParaFiltros(fechaDesde, fechaHasta);

        Double promedio = postulacionOfertaRepository.tiempoPromedioContratacion(
            idEmpresa, 
            fechas.getLeft(), 
            fechas.getRight()
        );
        return promedio != null ? promedio : 0.0;
    }

    //Recicle el DTO pero no le pongo el %
    private DistribucionPostulacionesPorPaisDTO localizacionCandidatos(Long idEmpresa, LocalDateTime fechaDesde, LocalDateTime fechaHasta){
        Pair<LocalDateTime, LocalDateTime> fechas = manejoFechasParaFiltros(fechaDesde, fechaHasta);

        List<PostulacionesPorPaisDTO> postulaciones = postulacionOfertaRepository.localizacionCandidatos(idEmpresa, fechas.getLeft(), fechas.getRight());
        
        Long total = postulaciones.stream().mapToLong(usuario -> usuario.getCantidad()).sum();
        
        postulaciones = postulaciones.stream()
        .sorted((a,b) -> Long.compare(b.getCantidad(), a.getCantidad())) // orden desc para tomar los 5 mas grandes
        .limit(5)
        .sorted((a,b) -> Long.compare(a.getCantidad(), b.getCantidad())) // reordeno asc como pide la hu
        .toList();
        
        DistribucionPostulacionesPorPaisDTO distribucion = new DistribucionPostulacionesPorPaisDTO();
        distribucion.setTotalPostulaciones(total);
        distribucion.setPostulaciones(postulaciones);

        return distribucion;
    }

    //PARA FILTROS DE FECHAS
    private Pair<LocalDateTime, LocalDateTime> manejoFechasParaFiltros(LocalDateTime fechaDesde, LocalDateTime fechaHasta){
        
        LocalDateTime fechaActual = ZonedDateTime.now(ZoneOffset.UTC).toLocalDateTime();

        //Si no se ingresa nada ==> toma el ultimo mes
        if(fechaDesde == null && fechaHasta == null){
            fechaHasta = fechaActual;
            fechaDesde = fechaHasta.minusMonths(1);
        } else if(fechaDesde != null && fechaHasta == null){ //Si se manda solo desde ==> toma desde la fecha ingresada hasta la fecha actual
            fechaHasta = fechaActual;
        } else if(fechaDesde == null && fechaHasta != null){ //Si se manda solo hasta ==> toma todo hasta la fecha ingresada
            fechaDesde = LocalDateTime.of(1800, 1, 1, 0, 0); 
        }
        if(fechaDesde != null && fechaHasta != null){
            // Validaciones
            if (fechaDesde.toLocalDate().isAfter(fechaHasta.toLocalDate())) {
                throw new IllegalArgumentException("La fecha desde no puede ser posterior a fecha hasta");
            }
        }

        return Pair.of(fechaDesde, fechaHasta);
    }

}
