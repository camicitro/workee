import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { permiso } from '../../modulos/seguridad/Gestion de roles/permiso';
import { SesionService } from '../../interceptors/sesion.service';
import { PermisoService } from '../../modulos/seguridad/Gestion de roles/permiso.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-parametros-page',
  imports: [CommonModule],
  templateUrl: './parametros-page.component.html',
  styleUrl: './parametros-page.component.css'
})
export class ParametrosPageComponent implements OnInit{
  permisosUsuario: permiso[] = [];

  opcionesConPermisos = {
    paisesProvincias: 'GESTIONAR_PAIS',
    generos: 'GESTIONAR_GENERO',
    rubros: 'GESTIONAR_RUBRO',
    habilidades: 'GESTIONAR_HABILIDAD',
    tiposHabilidad: 'GESTIONAR_TIPO_HABILIDAD',
    estadosBusqueda: 'GESTIONAR_ESTADO_BUSQUEDA',
    estadosUsuario: 'GESTIONAR_ESTADO_USUARIO',
    estadosOferta: 'GESTIONAR_ESTADO_OFERTA',
    tiposEvento: 'GESTIONAR_TIPO_EVENTO',
    etapas: 'GESTIONAR_ETAPA_PARAMETRO',
    tiposContrato: 'GESTIONAR_CONTRATO_OFERTA',
    modalidades: 'GESTIONAR_MODALIDAD_OFERTA',
  };

  constructor(private router: Router, private sesionService: SesionService, private permisoService: PermisoService) { }

  ngOnInit(): void {
      this.cargarPermisos();
  }

  navegarA(parametro: string): void {
    this.router.navigate(['/parametros', parametro]);
    // Ejemplo: si el parámetro es 'paises-provincias', la URL será /parametros/paises-provincias
  }


  cargarPermisos(): void {
    this.sesionService.rolUsuario$.subscribe((rol) => {
      if (rol) {
        this.permisoService.permisosdeunRol(rol.id!).subscribe({
          next: (permisos: permiso[]) => {
            this.permisosUsuario = permisos;
            console.log("Permisos en la página de Parámetros:", this.permisosUsuario);
          },
          error: (err) => {
            console.error("Error al obtener permisos en Parámetros:", err);
          }
        });
      }
    });
  }

  // Método para verificar si el usuario tiene un permiso específico
  tienePermiso(codigoPermiso: string): boolean {
    return this.permisosUsuario.some(p => p.codigoPermiso === codigoPermiso);
  }

  // Métodos para verificar la visibilidad de cada tarjeta
  tienePermisosUbicacion(): boolean {
    return this.tienePermiso(this.opcionesConPermisos.paisesProvincias);
  }

  tienePermisosDatosPersonales(): boolean {
    return this.tienePermiso(this.opcionesConPermisos.generos) || this.tienePermiso(this.opcionesConPermisos.rubros);
  }
  
  tienePermisosPerfilProfesional(): boolean {
    return this.tienePermiso(this.opcionesConPermisos.habilidades) || this.tienePermiso(this.opcionesConPermisos.tiposHabilidad);
  }

  tienePermisosEstados(): boolean {
    return this.tienePermiso(this.opcionesConPermisos.estadosBusqueda) || this.tienePermiso(this.opcionesConPermisos.estadosUsuario) || this.tienePermiso(this.opcionesConPermisos.estadosOferta);
  }

  tienePermisosEventosProcesos(): boolean {
    return this.tienePermiso(this.opcionesConPermisos.tiposEvento) || this.tienePermiso(this.opcionesConPermisos.etapas);
  }

  tienePermisosInformacionLaboral(): boolean {
    return this.tienePermiso(this.opcionesConPermisos.tiposContrato) || this.tienePermiso(this.opcionesConPermisos.modalidades);
  }

}
