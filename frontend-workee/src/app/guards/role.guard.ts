import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionService } from '../interceptors/sesion.service';
import Swal from 'sweetalert2';
import { map, catchError, of } from 'rxjs';

export const roleGuard: (permisosRequeridos: string | string[]) => CanActivateFn = 
  (permisosRequeridos: string | string[]) => {
    return (route, state) => {
      const sesionService = inject(SesionService);
      const router = inject(Router);

      // Si los permisos ya están cargados, verificamos directamente
      const permisosActuales = sesionService.getPermisosActuales();
      if (permisosActuales && permisosActuales.length > 0) {
        return verificarPermiso(sesionService, router, permisosRequeridos);
      }

      console.log("Guard: Permisos no encontrados. Cargando ahora...");
      return sesionService.cargarRolYPermisosUsuario().pipe(
        map(() => { // No necesitamos los permisos aquí, verificarPermiso los obtendrá del servicio
          return verificarPermiso(sesionService, router, permisosRequeridos);
        }),
        catchError(err => {
          console.error('Error cargando permisos en el guard:', err);
          mostrarErrorYRedirigir(sesionService, router);
          return of(false);
        })
      );
    };
};

function verificarPermiso(sesionService: SesionService, router: Router, permisosRequeridos: string | string[]): boolean {
  const tieneAlgunPermiso = Array.isArray(permisosRequeridos)
    ? permisosRequeridos.some(p => sesionService.tienePermiso(p))
    : sesionService.tienePermiso(permisosRequeridos);

  if (tieneAlgunPermiso) {
    console.log('Acceso concedido. Permisos requeridos:', permisosRequeridos);
    return true;
  } else {
    console.log('Acceso denegado. Permisos requeridos:', permisosRequeridos);
    mostrarErrorYRedirigir(sesionService, router);
    return false;
  }
}

function mostrarErrorYRedirigir(sesionService: SesionService, router: Router) {
  Swal.fire({
    icon: 'error',
    title: 'Acceso denegado',
    text: 'No tienes permisos para ingresar a esta pantalla.',
    confirmButtonText: 'Volver',
    confirmButtonColor: '#31A5DD'
  }).then(() => {
    sesionService.redirectBasedOnCategory();
    //router.navigate(['/error404']);
  });
}