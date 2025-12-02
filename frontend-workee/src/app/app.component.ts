import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from "./compartidos/SideBar/sidebar.component.component";
import { SesionService } from './interceptors/sesion.service';
import { map, Observable, Subscription, combineLatest, of, distinctUntilChanged, shareReplay, tap, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ToastContainerComponent } from './modulos/calendario y notificaciones/notificaciones/toast-container.component';
import { UsuarioService } from './modulos/seguridad/usuarios/usuario.service';
import { NotificacionPollingService } from './modulos/calendario y notificaciones/notificaciones/notificacion-polling.service';
import { permiso } from './modulos/seguridad/Gestion de roles/permiso';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, CommonModule, ToastContainerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'angular-app';
  sidebarVisible$!: Observable<boolean>;
  private sub?: Subscription;
  private pollingStarted = false;

  constructor(
    private sesionService: SesionService,
    private usuarioService: UsuarioService,
    private polling: NotificacionPollingService
  ) {}

  ngOnInit(): void {
    // Carga de rol para la UI (sidebar)
    this.sesionService.cargarRolUsuarioSinRedireccion();
    this.sidebarVisible$ = this.sesionService.rolUsuario$.pipe(map(rol => !!rol));

    const correoUsuario = this.sesionService.getCorreoUsuario();
    if (!correoUsuario) {
      console.warn('[App] No se encontró correo de usuario en sesión');
      return;
    }

    // Id de usuario (cacheado con shareReplay para no repetir la llamada)
    const idUsuario$ = this.usuarioService.getIdPorCorreo(correoUsuario).pipe(
      shareReplay(1)
    );

    // Carga rol + permisos, guarda en SesionService y devuelve permisos[]
    const permisos$: Observable<permiso[]> = this.sesionService.cargarRolYPermisosUsuario().pipe(
      tap(permisos => {
        console.log('[App] Permisos actuales obtenidos desde SesionService:', permisos);
      }),
      shareReplay(1)
    );

    // ¿Tiene el permiso VER_NOTIFICACIONES?
    const puedeVerNotificaciones$: Observable<boolean> = permisos$.pipe(
      map(perms =>
        Array.isArray(perms) &&
        perms.some(p =>
          p?.codigoPermiso === 'VER_NOTIFICACIONES' ||
          p?.nombrePermiso === 'VER_NOTIFICACIONES' ||
          p?.nombrePermiso === 'VER_NOTIFICACIONES'
        )
      ),
      distinctUntilChanged()
    );

    // Combino id + permiso y controlo el polling
    this.sub = combineLatest([idUsuario$, puedeVerNotificaciones$]).subscribe({
      next: ([idUsuario, puedeVer]) => {
        if (puedeVer) {
          if (!this.pollingStarted) {
            this.polling.start(idUsuario);
            this.pollingStarted = true;
            console.log('[App] Polling de notificaciones iniciado');
          }
        } else {
          if (this.pollingStarted) {
            this.polling.stop();
            this.pollingStarted = false;
            console.log('[App] Polling detenido (sin VER_NOTIFICACIONES)');
          } else {
            console.log('[App] Polling no iniciado (sin VER_NOTIFICACIONES)');
          }
        }
      },
      error: (err) => console.error('[App] Error combinando id/permiso para polling:', err)
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.polling.stop();
    this.pollingStarted = false;
  }
}
