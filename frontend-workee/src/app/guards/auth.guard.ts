import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionService } from '../interceptors/sesion.service';
import Swal from 'sweetalert2';

export const authGuard: CanActivateFn = (route, state) => {
  const sesionService = inject(SesionService);
  const router = inject(Router);

  if (!sesionService.isLoggedIn()) {
    Swal.fire({
          title: 'Acceso denegado',
          text: 'Por favor inicie sesión para ingresar a la página solicitada.',
          icon: 'error',
          confirmButtonColor: '#e02929ff',
    });
    router.navigate(['/login']);
    return false;
  }
  return true;
};
