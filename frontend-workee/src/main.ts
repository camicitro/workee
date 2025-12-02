import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { environment } from './Enviroments/enviroment';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authErrorInterceptor } from './app/interceptors/auth-error.interceptor';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideAnimations(),
    provideToastr(),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideStorage(() => getStorage()),
    provideHttpClient(withInterceptors([authErrorInterceptor]))
  ]
})
  .catch((err) => console.error(err));