import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subject,
  catchError,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { StorageService } from './storage.service';
import { RolService } from '../modulos/seguridad/usuarios/rol.service';
import { Rol } from '../modulos/seguridad/rol';
import { Router } from '@angular/router';
import { Categoria } from '../modulos/seguridad/categoria';
import { permiso } from '../modulos/seguridad/Gestion de roles/permiso';
import { PermisoService } from '../modulos/seguridad/Gestion de roles/permiso.service';

@Injectable({ providedIn: 'root' })
export class SesionService {
  redirectUrl: string = '';

  // Log In Event dispatcher
  private announceSource = new Subject<string>();

  // For login subscribers.
  announced$ = this.announceSource.asObservable();

  private rolUsuarioSubject = new BehaviorSubject<Rol | null>(null);
  rolUsuario$ = this.rolUsuarioSubject.asObservable();

  private spinnerSubject = new BehaviorSubject<boolean | null>(null);
  spinner$ = this.spinnerSubject.asObservable();

  private categoriaSubject = new BehaviorSubject<Categoria | null>(null);
  categoria$ = this.categoriaSubject.asObservable();

  private endpointURL = 'http://localhost:9090/auth';

  private loadingSubject = new BehaviorSubject<boolean>(true);
  loading$ = this.loadingSubject.asObservable();

  private permisosSubject = new BehaviorSubject<permiso[] | null>(null);
  permisos$ = this.permisosSubject.asObservable();

  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private rolService: RolService,
    private router: Router,
    private permisoService: PermisoService
  ) {}

  logout(): void {
    this.rolUsuarioSubject.next(null);
    this.categoriaSubject.next(null);
    this.permisosSubject.next(null);
    this.clearLocalSession();
    this.router.navigate(['/inicio']);
  }

  clearLocalSession(): void {
    // Limpia local y session storage de forma SSR-safe
    this.storage.clearAll();
    // Después de limpiar todo, seteamos el flag (si estamos en browser esto persiste)
    this.storage.setItem('isLoggedIn', 'false');
    // Si tenés listeners de sesión, podrías emitir algo:
    this.announceSource.next('logout');
  }

  getCurrentSesion(): string | null {
    // En tu código guardás el token en currentSession (string). Si fuera JSON, acá lo parseás.
    return this.storage.getItem('currentSession');
  }

  isLoggedIn(): boolean {
    return this.storage.getItem('isLoggedIn') === 'true';
  }

  startLocalSession(token: string): void {
    this.storage.setItem('token', token);

    this.storage.setItem('currentSession', token);

    this.storage.setItem('isLoggedIn', 'true'); // Podés notificar a subscriptores que hay login:

    this.announceSource.next('login');
  }

  getToken(): string | null {
    return this.storage.getItem('token');
  }

  getPayload(): any {
    const token = this.getToken();

    if (!token) return null;

    const payload = token.split('.')[1];

    return JSON.parse(atob(payload));
  }

  getCorreoUsuario(): string | null {
    const payload = this.getPayload(); // console.log("el payload es: ", payload)

    return payload?.sub || payload?.correoUsuario || null;
  }

  cargarRolUsuario(): void {
    this.setLoading(true);

    const correo = this.getCorreoUsuario();

    if (!correo) {
      this.setLoading(false);
      console.error('No se pudo obtener el correo del token.');
      return;
    }

    this.rolService.buscarRolPorCorreoUsuario(correo).subscribe({
      next: (rol) => {
        this.rolUsuarioSubject.next(rol);

        //console.log('Rol del usuario cargado:', rol);

        const currentUrl = this.router.url;
        const rutasPublicas = ['/login', '/registro', '/inicio'];

        if (currentUrl === '/' || rutasPublicas.includes(currentUrl)) {
          this.redirectBasedOnCategory();
          this.setLoading(false);
        } else {
          this.setLoading(false);
        }
      },

      error: (err) => {
        console.error('Error al obtener rol del usuario:', err);

        this.rolUsuarioSubject.next(null);

        this.setLoading(false);
      },
    });
  }

  getRolActual(): Rol | null {
    console.log('el rol actual es: ', this.rolUsuarioSubject.value);

    return this.rolUsuarioSubject.value;
  }

  cargarCategoriaUsuario(): void {
    this.setLoading(true);

    this.spinnerSubject.next(true);

    const correo = this.getCorreoUsuario();

    if (!correo) {
      console.error('No se pudo obtener el correo del token.');

      this.categoriaSubject.next(null);

      this.setLoading(false);

      this.spinnerSubject.next(false);

      return;
    } // 1) Si ya tengo el rol cargado, saco la categoría directo

    const rolActual = this.rolUsuarioSubject.value;

    if (rolActual) {
      this.categoriaSubject.next(rolActual.categoriaRol ?? null);

      this.setLoading(false);

      this.spinnerSubject.next(false);

      return;
    } // 2) Si no hay rol en memoria, lo busco por correo y extraigo la categoría

    this.rolService.buscarRolPorCorreoUsuario(correo).subscribe({
      next: (rol) => {
        this.rolUsuarioSubject.next(rol); // dejo el rol cacheado para el resto de la app

        this.categoriaSubject.next(rol?.categoriaRol ?? null);

        this.setLoading(false);

        this.spinnerSubject.next(false);
      },

      error: (err) => {
        console.error('Error al obtener rol del usuario:', err);

        this.rolUsuarioSubject.next(null);

        this.categoriaSubject.next(null);

        this.setLoading(false);

        this.spinnerSubject.next(false);
      },
    });
  }

  getNombreCategoriaUsuario(): string | null {
    return this.categoriaSubject.value?.nombreCategoriaRol ?? null;
  }

  getCategoriaActual(): Categoria | null {
    console.log('la categoria actual es: ', this.categoriaSubject.value);

    return this.categoriaSubject.value;
  }

  cargarRolUsuarioSinRedireccion() {
    this.setLoading(true);

    this.spinnerSubject.next(true);
    const correo = this.getCorreoUsuario();

    if (!correo) {
      this.setLoading(false);
      this.spinnerSubject.next(false);
      console.error('No se pudo obtener el correo del token.');
      return;
    }

    this.rolService.buscarRolPorCorreoUsuario(correo).subscribe({
      next: (rol) => {
        this.rolUsuarioSubject.next(rol);
        this.setLoading(false);
        this.spinnerSubject.next(false);
      },

      error: (err) => {
        console.error('Error al obtener rol del usuario:', err);
        this.rolUsuarioSubject.next(null);
        this.setLoading(false);
        this.spinnerSubject.next(false);
      },
    });
  }

  setLoading(isLoading: boolean) {
    this.loadingSubject.next(isLoading);
  }

  redirectBasedOnCategory(): void {
    //this.cargarRolYPermisosUsuario(); 
    const url = this.redirectUrl;

    if (this.redirectUrl) {
      this.redirectUrl = '';
      this.router.navigateByUrl(url);
      return;
    }

    const rolActual = this.getRolActual();

    if (!rolActual || !rolActual.categoriaRol || !rolActual.categoriaRol.nombreCategoriaRol) {
      console.warn(
        'Categoría o Rol no disponibles. Redirigiendo a página por defecto.'
      );

      this.router.navigate(['/buscar-empresas']);
      return;
    }

    const categoria = rolActual.categoriaRol.nombreCategoriaRol.toUpperCase();

    this.realizarRedireccion(categoria);
  }

  cargarRolYPermisosUsuario(): Observable<permiso[]> {
    const correo = this.getCorreoUsuario();

    if (!correo) {
      console.error('No se pudo obtener el correo del token.');
      return throwError(() => new Error('No hay correo en el token')); 
    }

    return this.rolService.buscarRolPorCorreoUsuario(correo).pipe(
      tap((rol) => {
        this.rolUsuarioSubject.next(rol); 
      }), 

      switchMap((rol) => {
        if (rol && rol.id) {
          return this.permisoService.permisosdeunRol(rol.id);
        } else {
          // Si no hay rol, devolvemos un observable que emite un array vacío

          return of([]);
        }
      }), // Finalmente, usamos tap() de nuevo para guardar los permisos obtenidos

      tap((permisos) => {
        this.permisosSubject.next(permisos);

        console.log(
          'Permisos del usuario cargados en SesionService:',
          permisos
        );
      })
    );
  }

  tienePermiso(nombrePermiso: string): boolean {
    const permisos = this.permisosSubject.value;

    if (!permisos) {
      return false;
    }

    return permisos.some((p) => p.codigoPermiso === nombrePermiso); //ACA CAMBIO EL p.nombrePermiso por p.codigoPermiso
  }

  getPermisosActuales(): permiso[] | null {
    return this.permisosSubject.value;
  }

  private redirectBasedOnCategoryIfNeeded(): void {
    const currentUrl = this.router.url;

    const rutasPublicas = [
      '/login',
      '/registro',
      '/inicio',
      '/cuentaVerificada',
      '/nuevaContrasenia',
    ]; // Solo redirigir si estamos en una página pública o la raíz después de iniciar sesión

    if (
      currentUrl === '/' ||
      rutasPublicas.some((ruta) => currentUrl.startsWith(ruta))
    ) {
      this.redirectBasedOnCategory();
    }
  }

  private realizarRedireccion(categoria: string): void {
    switch (categoria) {
      case 'CANDIDATO':
        //this.router.navigate(['/candidato/perfil']);
        this.router.navigate(['/postulaciones']);
        break;
      case 'EMPRESA':
        //this.router.navigate(['/empresas/perfil']); 
        this.router.navigate(['/visualizar-oferta']); 
        break;
      case 'EMPLEADO':
        //this.router.navigate(['/empleados/perfil']);
        this.router.navigate(['/visualizar-oferta']); 
        break;
      case 'ADMINISTRADOR_SISTEMA':
        this.router.navigate(['/usuarios']); 
        break;
      default:
        console.warn('Categoría no reconocida, redirigiendo a la página por defecto.');
        this.router.navigate(['/']);
    }
  }
}
