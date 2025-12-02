import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { catchError, throwError } from 'rxjs';
import { SesionService } from './sesion.service';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const location = inject(Location);
  const sesionService = inject(SesionService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.error.message === "Un error inesperado ha ocurrido: Access Denied") {
        Swal.fire({
          icon: 'error',
          title: 'Acceso denegado',
          text: 'No tienes permisos para ingresar a esta pantalla.',
          confirmButtonText: 'Volver',
          confirmButtonColor: '#31A5DD'
        }).then(() => {
          sesionService.redirectBasedOnCategory();
        });
      }
      return throwError(() => error);
    })
  );
};