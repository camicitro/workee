import { Component, OnInit } from '@angular/core';
import { SidebarService } from './sidebar.service';
import { Router, RouterModule } from '@angular/router';
import { SesionService } from '../../interceptors/sesion.service';
import { PermisoService } from '../../modulos/seguridad/Gestion de roles/permiso.service';
import { permiso } from '../../modulos/seguridad/Gestion de roles/permiso';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { NotificacionStoreService } from '../../modulos/calendario y notificaciones/notificaciones/notificacion-store.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.component.html',
  styleUrls: ['./sidebar.component.component.css'],
  imports:[CommonModule,RouterModule]
})
export class SidebarComponent implements OnInit {

  menuItems: any[] = [];
  permisosUsuario: permiso[] = [];

  correoUsuario: string | null = '';
  nombreRol: string | null = '';
  pendientesCount = 0; 
  
  constructor(
    private sideBarService: SidebarService,
    private router: Router,
    private sesionService: SesionService,
    private permisoService: PermisoService,
    private notifStore: NotificacionStoreService
  ) {}

  ngOnInit(): void {
    // Cargamos el rol apenas entra
    
    this.sesionService.cargarRolUsuarioSinRedireccion();
    this.cargarPermisos();

    this.correoUsuario = this.sesionService.getCorreoUsuario();
    this.nombreRol = this.sesionService.getRolActual()?.nombreRol || '';
    console.log("Correo usuario en sidebar: ", this.correoUsuario);
    console.log("Nombre rol en sidebar: ", this.nombreRol);
    this.notifStore.unreadCount$.subscribe(n => this.pendientesCount = n ?? 0);
  }

  logout(){
    Swal.fire({
      title: "¿Está seguro de que desea cerrar sesión?",
      icon: "question",
      iconColor: "#31A5DD",
      showCancelButton: true,
      confirmButtonColor: "#31A5DD",
      cancelButtonColor: "#697077",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "No, volver",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.sesionService.logout();

        Swal.fire({
          toast: true,
          position: "top",
          icon: "success",
          title: "Sesión cerrada correctamente",
          showConfirmButton: false,
          timer: 2000
        });
      }
    });   
  }

  isNotificacionesItem(item: any): boolean {
    return (item?.ruta === '/notificaciones') ||
           (String(item?.titulo ?? '').toLowerCase() === 'notificaciones');
  }



  toggleSubmenu(item: any) {
    item.open = !item.open;
  }

  private puedeMostrar(item: any): boolean {
    // Si el item tiene un permiso propio → chequeamos
    if (item.codigoPermiso) {
      return this.permisosUsuario.some(p => p.codigoPermiso === item.codigoPermiso);
    }

    // Si no tiene permiso pero tiene hijos → al menos un hijo debe poder mostrarse
    if (item.children && item.children.length > 0) {
      return item.children.some((child: any) => this.puedeMostrar(child));
    }

    // Si no tiene permiso ni hijos → no se muestra
    return false;
  }

  private cargarPermisos(){
    this.sesionService.rolUsuario$.subscribe((rol) => {
      if (rol) {
        // Con el rol.id, traemos los permisos
        this.permisoService.permisosdeunRol(rol.id!).subscribe({
          next: (permisos: permiso[]) => {
            this.permisosUsuario = permisos;
            console.log(this.permisosUsuario)

            const menuCompleto = this.sideBarService.getMenu();
            const menuFiltrado = [];

            for (const item of menuCompleto) {
              // Clona el item para no modificar el original
              const itemFiltrado = { ...item };
              
              //Caso especial del panel de control
              if(item.titulo === "Panel de control"){
                const permisosParametros = [
                  "GESTIONAR_ROLES",
                  "GESTIONAR_USUARIOS",
                  "GESTIONAR_ESTADO_BUSQUEDA",
                  "GESTIONAR_ESTADO_OFERTA",
                  "GESTIONAR_ESTADO_USUARIO",
                  "GESTIONAR_ETAPA_PARAMETRO",
                  "GESTIONAR_GENERO",
                  "GESTIONAR_HABILIDAD",
                  "GESTIONAR_MODALIDAD_OFERTA",
                  "GESTIONAR_PAIS",
                  "GESTIONAR_PROVINCIA",
                  "GESTIONAR_RUBRO",
                  "GESTIONAR_CONTRATO_OFERTA",
                  "GESTIONAR_TIPO_EVENTO",
                  "GESTIONAR_TIPO_HABILIDAD"
                ];

                const tienePermisoRoles = this.permisosUsuario.some(p => p.codigoPermiso === "GESTIONAR_ROLES");
                const tienePermisoParametros = this.permisosUsuario.some(p => 
                    p.codigoPermiso && permisosParametros.includes(p.codigoPermiso) && p.codigoPermiso !== "GESTIONAR_ROLES"
                );
                const hijosFiltrados = itemFiltrado.children?.filter(child => {
                    if (child.titulo === "Roles") {
                        return tienePermisoRoles;
                    }
                    if (child.titulo === "Parámetros") {
                        return tienePermisoParametros;
                    }
                    // Para cualquier otro hijo, se mantiene la lógica de un solo permiso
                    return child.codigoPermiso && this.permisosUsuario.some(p => p.codigoPermiso === child.codigoPermiso);
                });
                if (hijosFiltrados && hijosFiltrados.length > 0) {
                    itemFiltrado.children = hijosFiltrados;
                    menuFiltrado.push(itemFiltrado);
                }
                
                continue;
              }

              // Si el item tiene hijos, los filtramos
              if (itemFiltrado.children && itemFiltrado.children.length > 0) {
                itemFiltrado.children = itemFiltrado.children.filter(child =>
                  this.permisosUsuario.some(p => p.codigoPermiso === child.codigoPermiso)
                );
                // Si después del filtro, el item padre aún tiene hijos, lo agregamos
                if (itemFiltrado.children.length > 0) {
                  menuFiltrado.push(itemFiltrado);
                }
              } 
              // Si el item no tiene hijos, lo agregamos solo si el usuario tiene el permiso
              else if (this.permisosUsuario.some(p => p.codigoPermiso === itemFiltrado.codigoPermiso)) {
                menuFiltrado.push(itemFiltrado);
              }
            }

            this.menuItems = menuFiltrado;
          },
          error: (err) => {
            console.error("Error al obtener permisos:", err);
          }
        });
      }
    });
  }

}
