// token.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SesionService } from './sesion.service';

// ⚠️ Idealmente mové esto a environment
const API_BASE = 'http://localhost:9090';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const sesionService = inject(SesionService);

  // 1) Tomamos el token de un lugar SSR-safe (SesionService -> StorageService)
  const token = sesionService.getToken();

  // 2) Por seguridad: solo adjuntar en requests al backend propio
  const isApiRequest =
    req.url.startsWith(API_BASE) ||
    req.url.startsWith('/api') ||
    req.url.includes('localhost:9090');

  // 3) Evitar agregar Authorization en endpoints públicos de auth
  const isAuthEndpoint = /\/auth\/(login|signup|register|refresh|confirm|logout)/.test(req.url);

  // 4) Evitar sobrescribir si ya viene un Authorization por alguna razón
  const hasAuthHeader = req.headers.has('Authorization');

  // 5) Clonamos solo si corresponde
  const shouldAttach =
    !!token && isApiRequest && !isAuthEndpoint && !hasAuthHeader;

  const finalReq = shouldAttach
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(finalReq);
};
