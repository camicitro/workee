import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';  

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { tokenInterceptor } from './interceptors/token.interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; 
import { MyPreset } from './MyPreset'

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), provideClientHydration(withEventReplay()),  
    provideHttpClient(withInterceptors([tokenInterceptor])),
    importProvidersFrom(HttpClientModule),
    providePrimeNG({ theme: { preset: MyPreset,  options: {
            darkModeSelector: false || 'none'
        } } })
  ],
    };

