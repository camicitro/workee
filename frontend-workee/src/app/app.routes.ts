import { Routes } from '@angular/router';
import { ListadoProvinciasComponent } from './admin/ABMProvincia/listado-provincias/listado-provincias.component';
import { ListadoPaisesComponent } from './admin/ABMPais/listado-paises/listado-paises.component';
import { ListadoEstadosBusquedaLaboralComponent } from './admin/ABMEstadoBusquedaLaboral/listado-estados-busqueda-laboral/listado-estados-busqueda-laboral.component';
import { ListadoEstadosOfertaComponent } from './admin/ABMEstadoOferta/listado-estados-oferta/listado-estados-oferta.component';
import { ListadoEstadosUsuarioComponent } from './admin/ABMEstadoUsuario/listado-estados-usuario/listado-estados-usuario.component';
import { ListadoEtapasComponent } from './admin/ABMEtapa/listado-etapas/listado-etapas.component';
import { ListadoGenerosComponent } from './admin/ABMGenero/listado-generos/listado-generos.component';
import { ListadoHabilidadesComponent } from './admin/ABMHabilidad/listado-habilidades/listado-habilidades.component';
import { ListadoModalidadesComponent } from './admin/ABMModalidad/listado-modalidades/listado-modalidades.component';
import { ListadoRubrosComponent } from './admin/ABMRubro/listado-rubros/listado-rubros.component';
import { ListadoTiposContratoComponent } from './admin/ABMTipoContrato/listado-tipos-contrato/listado-tipos-contrato.component';
import { ListadoTiposEventoComponent } from './admin/ABMTipoEvento/listado-tipos-evento/listado-tipos-evento.component';
import { ListadoTiposHabilidadComponent } from './admin/ABMTipoHabilidad/listado-tipos-habilidad/listado-tipos-habilidad.component';
import { CrearEmpleadoComponent } from './modulos/empresa/empleados/crear-empleado/crear-empleado.component';
import { ListadoEmpleadosComponent } from './modulos/empresa/empleados/listado-empleados/listado-empleados.component';
import { PerfilEmpleadoComponent } from './modulos/empresa/empleados/perfil-empleado/perfil-empleado.component';

import { PerfilEmpresaComponent } from './modulos/empresa/empresa/perfil-empresa/perfil-empresa.component';
import { LoginPageComponent } from './modulos/seguridad/Login/login-page/login-page.component';
import { PerfilCandidatoComponent } from './modulos/candidato/perfil-candidato/perfil-candidato.component';
import { BusquedaCandidatosComponent } from './modulos/busqueda/busqueda-candidatos/busqueda-candidatos.component';
import { DetalleCandidatoComponent } from './modulos/busqueda/busqueda-candidatos/detalle-candidato/detalle-candidato.component';
import { BusquedaEmpresasComponent } from './modulos/busqueda/busqueda-empresas/busqueda-empresas.component';
import { DetalleEmpresaComponent } from './modulos/busqueda/busqueda-empresas/detalle-empresa/detalle-empresa.component';

import { RegistroEmpresaComponent } from './modulos/seguridad/Registro/Registro Empresa/registro-empresa.component';
import { RegistroComponent } from './modulos/seguridad/Registro/registro.component';
import { RegistroCandidatoComponent } from './modulos/seguridad/Registro/Registro Candidato/registro-candidato.component';
import { PaginaInicioComponent } from './compartidos/Pagina Incio/pagina-inicio.component';
import { ConfirmacionComponent } from './modulos/seguridad/Registro/Confirmacion/confirmacion.component';
import { ListadoUsuariosComponent } from './modulos/seguridad/usuarios/listado-usuarios/listado-usuarios.component';
import { DetalleUsuarioComponent } from './modulos/seguridad/usuarios/listado-usuarios/detalle-usuario/detalle-usuario.component';
import { RecuperarContraseniaComponent } from './modulos/seguridad/Recuperacion Contraseña/Recuperar contrasenia/recuperar-contrasenia.component';
import { GestionderolesComponent } from './modulos/seguridad/Gestion de roles/GDR Componente/gestion-de-roles.component';
import { HabilitacionEmpresasComponent } from './modulos/seguridad/habilitacion-empresas/habilitacion-empresas.component';
import { SidebarComponent } from './compartidos/SideBar/sidebar.component.component';

import { ParametrosPageComponent } from './admin/parametros-page/parametros-page.component';
import { authGuard } from './guards/auth.guard';
import { publicGuard } from './guards/public.guard';
import { DetalleEmpresaPendienteComponent } from './modulos/seguridad/habilitacion-empresas/detalle-empresa-pendiente/detalle-empresa-pendiente/detalle-empresa-pendiente.component';

import { BusquedaOfertasComponent } from './modulos/busqueda/busqueda-ofertas/busqueda-ofertas.component';
import { DetalleOfertaComponent } from './modulos/busqueda/busqueda-ofertas/detalle-oferta/detalle-oferta.component';

import { CrearOfertaComponent } from './modulos/gestion de ofertas/crear oferta/crear oferta component/crear-oferta.component';
import { VisualizarOfertasPropiasComponent } from './modulos/gestion de ofertas/visualizar oferta/visualizar-ofertas-propias.component';
import { EtapasEmpresaComponent } from './modulos/gestion de ofertas/etapas-empresa/etapas-empresa.component';
import { DetalleOfertaPropiaComponent } from './modulos/gestion de ofertas/visualizar oferta/detalle-oferta-propia/detalle-oferta-propia.component';
import { BackupComponent } from './modulos/backup y recuperacion/backup.component';
import { CalendarioCandidatoComponent } from './modulos/calendario y notificaciones/calendario y evento/calendario candidato/calendario-candidato';
import { EventoComponent } from './modulos/calendario y notificaciones/calendario y evento/componente evento/evento.component';
import { CalendarioEmpresaComponent } from './modulos/calendario y notificaciones/calendario y evento/calendario empresa/calendario-empresa';
import { CalendarioEmpleadoComponent } from './modulos/calendario y notificaciones/calendario y evento/calendario empleado/calendario-empleado';
import { CalendarioBaseComponent } from './modulos/calendario y notificaciones/calendario y evento/componente calendario/calendario.component';
import { ListadoPostulacionesComponent } from './modulos/postulaciones/listado-postulaciones/listado-postulaciones.component';
import { VideollamadaComponent } from './modulos/videollamadas/videollamada/videollamada.component';
import { DetallePostulacionCandidatoComponent } from './modulos/postulaciones/listado-postulaciones/detalle-postulacion-candidato/detalle-postulacion-candidato.component';
import { DetallePostulacionEmpresaComponent } from './modulos/postulaciones/detalle-postulacion-empresa/detalle-postulacion-empresa.component';
import { NotificacionComponent } from './modulos/calendario y notificaciones/notificaciones/notificaciones component/notificacion.component';

import { MetricasAdminComponent } from './modulos/metricas/admin/metricas-admin/metricas-admin.component';
import { MetricasCandidatoComponent } from './modulos/metricas/candidato/metricas-candidato/metricas-candidato.component';
import { MetricasEmpresaComponent } from './modulos/metricas/empresa/metricas-empresa/metricas-empresa.component';
import { DetalleNotificacionComponent } from './modulos/calendario y notificaciones/notificaciones/detalle notificacion/detalle-notificacion.component';
import { roleGuard } from './guards/role.guard';
import { Error404Component } from './compartidos/error404/error404/error404.component';

export const routes: Routes = [
    { path: 'parametros', component: ParametrosPageComponent, canActivate: [authGuard, roleGuard([
        'GESTIONAR_PAIS',
        'GESTIONAR_PROVINCIA',
        'GESTIONAR_GENERO',
        'GESTIONAR_ESTADO_USUARIO',
        'GESTIONAR_TIPO_EVENTO',
        'GESTIONAR_CONTRATO_OFERTA',
        'GESTIONAR_ESTADO_BUSQUEDA',
        'GESTIONAR_ESTADO_OFERTA',
        'GESTIONAR_MODALIDAD_OFERTA',
        'GESTIONAR_TIPO_HABILIDAD',
        'GESTIONAR_RUBRO',
        'GESTIONAR_HABILIDAD',
        'GESTIONAR_ETAPA_PARAMETRO'
        ])] },
    { path: 'parametros/paises', component: ListadoPaisesComponent, canActivate: [roleGuard(['GESTIONAR_PAIS']), authGuard] },
    { path: 'provincias/:idPais', component: ListadoProvinciasComponent, canActivate: [roleGuard(['GESTIONAR_PROVINCIA']), authGuard] },
    { path: 'parametros/generos', component: ListadoGenerosComponent, canActivate: [roleGuard(['GESTIONAR_GENERO']), authGuard] },
    { path: 'parametros/estadosUsuario', component: ListadoEstadosUsuarioComponent, canActivate: [roleGuard(['GESTIONAR_ESTADO_USUARIO']), authGuard] },
    { path: 'parametros/tiposEvento', component: ListadoTiposEventoComponent, canActivate: [roleGuard(['GESTIONAR_TIPO_EVENTO']), authGuard] },
    { path: 'parametros/tiposContrato', component: ListadoTiposContratoComponent, canActivate: [roleGuard(['GESTIONAR_CONTRATO_OFERTA']), authGuard] },
    { path: 'parametros/estadosBusqueda', component: ListadoEstadosBusquedaLaboralComponent, canActivate: [roleGuard(['GESTIONAR_ESTADO_BUSQUEDA']), authGuard] },
    { path: 'parametros/estadosOferta', component: ListadoEstadosOfertaComponent, canActivate: [roleGuard(['GESTIONAR_ESTADO_OFERTA']), authGuard] },
    { path: 'parametros/modalidades', component: ListadoModalidadesComponent, canActivate: [roleGuard(['GESTIONAR_MODALIDAD_OFERTA']), authGuard] },
    { path: 'parametros/tiposHabilidad', component: ListadoTiposHabilidadComponent, canActivate: [roleGuard(['GESTIONAR_TIPO_HABILIDAD']), authGuard] },
    { path: 'parametros/rubros', component: ListadoRubrosComponent, canActivate: [roleGuard(['GESTIONAR_RUBRO']), authGuard] },
    { path: 'parametros/habilidades', component: ListadoHabilidadesComponent, canActivate: [roleGuard(['GESTIONAR_HABILIDAD']), authGuard] },
    { path: 'parametros/etapas', component: ListadoEtapasComponent, canActivate: [roleGuard(['GESTIONAR_ETAPA_PARAMETRO']), authGuard] },
    
    { path: 'empleados', component: ListadoEmpleadosComponent, canActivate: [roleGuard(['GESTIONAR_EMPLEADOS']), authGuard] },
    { path: 'empleados/crear', component: CrearEmpleadoComponent, canActivate: [roleGuard(['GESTIONAR_EMPLEADOS']), authGuard] },
    
    { path: 'inicio', component: PaginaInicioComponent, canActivate: [publicGuard] }, 
    { path: 'login', component: LoginPageComponent, canActivate: [publicGuard] },
    
    { path: 'candidato/perfil', component: PerfilCandidatoComponent, canActivate: [authGuard] },//NO AGREGAR EL ROLEGUARD!!!!!!
    { path: 'empresas/perfil', component: PerfilEmpresaComponent, canActivate: [authGuard] }, //NO AGREGAR EL ROLEGUARD!!!!!!
    { path: 'empleados/perfil', component: PerfilEmpleadoComponent, canActivate: [authGuard] }, //NO AGREGAR EL ROLEGUARD!!!!!!
    { path: 'empleados/perfil/:idEmpleado', component: PerfilEmpleadoComponent, canActivate: [authGuard] },
    { path: 'usuarios', component: ListadoUsuariosComponent, canActivate: [authGuard] }, //NO AGREGAR EL ROLEGUARD!!!!!!

    { path: 'registro', component: RegistroComponent, canActivate: [publicGuard]},
    { path: 'registro-empresa', component: RegistroEmpresaComponent, canActivate: [publicGuard] },
    { path: 'registro-candidato', component: RegistroCandidatoComponent, canActivate: [publicGuard] },
    
    { path: 'visualizar-oferta', component: VisualizarOfertasPropiasComponent},
    { path: 'visualizar-oferta/:id', component: DetalleOfertaPropiaComponent},
    { path: 'crear-oferta', component: CrearOfertaComponent, canActivate: [roleGuard(['GESTION_OFERTAS']), authGuard]},
    { path: 'cuentaVerificada', component: ConfirmacionComponent},
    
    { path: 'backup', component: BackupComponent, canActivate: [roleGuard(['BACKUP']), authGuard]},
    
    { path: 'usuarios/detalle/:idUsuario', component: DetalleUsuarioComponent, canActivate: [authGuard] },
    { path: 'habilitaciones', component: HabilitacionEmpresasComponent, canActivate: [roleGuard(['HABILITACION_EMPRESA']), authGuard]  },
    { path: 'habilitaciones/detalle-empresa/:id', component: DetalleEmpresaPendienteComponent, canActivate: [authGuard] },

    { path: 'buscar-candidatos', component: BusquedaCandidatosComponent, canActivate: [roleGuard(['BUSCAR_CANDIDATOS']), authGuard] },
    { path: 'buscar-candidatos/detalle/:idCandidato', component: DetalleCandidatoComponent, canActivate: [roleGuard(['BUSCAR_CANDIDATOS']), authGuard] },
    { path: 'buscar-empresas', component: BusquedaEmpresasComponent, canActivate: [roleGuard(['BUSCAR_EMPRESAS']), authGuard] },
    { path: 'buscar-empresas/detalle/:idEmpresa', component: DetalleEmpresaComponent, canActivate: [roleGuard(['BUSCAR_EMPRESAS']), authGuard] },
    
    { path: 'nuevaContrasenia', component: RecuperarContraseniaComponent, canActivate: [publicGuard]},
    { path: 'gestion-de-roles', component: GestionderolesComponent, canActivate: [roleGuard(['GESTIONAR_ROLES']), authGuard]},

    { path: 'buscar-ofertas', component: BusquedaOfertasComponent, canActivate: [roleGuard(['BUSCAR_OFERTAS']), authGuard]},
    { path: 'buscar-ofertas/detalle/:idOferta', component: DetalleOfertaComponent, canActivate: [roleGuard(['BUSCAR_OFERTAS']), authGuard] },
    
    { path: 'ofertas/etapas', component: EtapasEmpresaComponent },
    
    
    { path: 'metricas/admin', component: MetricasAdminComponent, canActivate: [roleGuard(['METRICAS_SISTEMA']), authGuard] },
    { path: 'metricas/candidato', component: MetricasCandidatoComponent, canActivate: [roleGuard(['METRICAS_CANDIDATO']), authGuard] },
    { path: 'metricas/empresa', component: MetricasEmpresaComponent, canActivate: [roleGuard(['METRICAS_EMPRESA']), authGuard] },

    
    { path: 'videollamada', component: VideollamadaComponent },
    
    { path: 'postulaciones', component: ListadoPostulacionesComponent },
    { path: 'postulaciones/detalle/:idPostulacion', component: DetallePostulacionCandidatoComponent },
    { path: 'postulaciones/detalle-candidato/:idPostulacion', component: DetallePostulacionEmpresaComponent },
    

    { path: 'notificaciones', component: NotificacionComponent },
    { path: 'calendario', component: CalendarioBaseComponent },
    { path: 'calendario/candidato', component: CalendarioCandidatoComponent },
    { path: 'calendario/empresa',   component: CalendarioEmpresaComponent },
    { path: 'calendario/empleado',  component: CalendarioEmpleadoComponent },
    { path: 'eventos/:id', component: EventoComponent },
    {path:  'notificacion/:id', component: DetalleNotificacionComponent},

    { path: 'error-404', component: Error404Component },
    
    // ************** IMPORTANTE !!!! Dejar esta ultima ruta siempre al final ***************
    { path: '**', redirectTo: '/error-404' },







































    {path: `side-bar`, component: SidebarComponent}
];
