import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionService } from '../interceptors/sesion.service';
import Swal from 'sweetalert2';

export const publicGuard: CanActivateFn = (route, state) => {
  const sesionService = inject(SesionService);
  const router = inject(Router);

  if (sesionService.isLoggedIn()) {
   Swal.fire({
      title: 'Acceso denegado',
      text: 'Ya se encuentra logueado, no puede ingresar a esta pantalla.',
      icon: 'error',
      confirmButtonColor: '#e02929ff',
    });
    sesionService.setLoading(false);
    return false; 
  }

  // Si no está logueado, permite el acceso.
  sesionService.setLoading(false);
  return true;
};
